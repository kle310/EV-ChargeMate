export interface StationStatus {
  station_id: string;
  plug_type: string;
  plug_status: string;
  duration: number;
  timestamp: Date;
}

export interface Station {
  station_id: string;
  name: string;
  address: string;
  city: string;
  max_electric_power: number;
  multi_port_charging_allowed: boolean;
  price: number;
  price_unit: string;
  availability_status: boolean;
  latitude: number;
  longitude: number;
  created_at: Date;
  updated_at: Date;
  cpo_id: string;
  realtime_enabled: boolean;
  region: string;
  status?: string;
}

export interface GroupedChargers {
  free: Station[];
  paid: Station[];
}
