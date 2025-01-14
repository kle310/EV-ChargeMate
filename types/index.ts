export interface StationStatus {
  station_id: string;
  plug_type: string;
  plug_status: string;
  timestamp: Date;
}

export interface Station {
  station_id: string;
  name: string;
  address: string;
  city: string;
  max_electric_power: number;
  multi_port_charging_allowed: boolean;
  price_per_kwh: number;
  availability_status: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProgressResponse {
  status: number;
}
