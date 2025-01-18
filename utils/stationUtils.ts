import { Pool } from 'pg';
import { config } from '../config/api';

interface EVSE {
  plugType: string;
  portStatus: string;
  portOcppStatus: string;
}

interface PortStatus {
  plugType: string;
  portOcppStatus: string;
}

interface Station {
  id: string;
}

export async function fetchStationData(stationId: string): Promise<any> {
  try {
    const response = await fetch(`${config.stationEndpoint}${stationId}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch data for station ${stationId}: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching data for station ${stationId}`, error);
    throw error;
  }
}

export function determinePortStatus(evses: EVSE[] | null): PortStatus | null {
  if (!evses || evses.length === 0) return null;
  
  if (evses[0].portStatus === "OFFLINE") {
    return { plugType: evses[0].plugType, portOcppStatus: "Offline" };
  }

  if (evses.length > 1) {
    const [firstPort, secondPort] = evses;

    if (["Charging", "Faulted"].includes(firstPort.portOcppStatus)) {
      return firstPort;
    }

    if (["Charging", "Faulted"].includes(secondPort.portOcppStatus)) {
      return secondPort;
    }

    return firstPort.portOcppStatus === "Available" ? firstPort : secondPort;
  }

  return evses[0];
}

export async function getStationsFromDB(pool: Pool): Promise<Station[]> {
  try {
    const result = await pool.query('SELECT station_id FROM stations WHERE is_active = true');
    return result.rows.map(row => ({ id: row.station_id }));
  } catch (error) {
    console.error('Error fetching stations from database:', error);
    throw error;
  }
}
