export type Vehicle = {
  id: string;
  plate: string;
  type: string;
};

export type Driver = {
  id: string;
  name: string;
};

export type Position = {
  id: string;
  vehicle: Vehicle;
  driver: Driver | null;
  fix_time: string;
  device_time: string;
  server_time: string;
  accuracy: number;
  altitude: number;
  latitude: number;
  longitude: number;
  course: number;
  speed: number;
  address: string;
  source: string;
  valid: boolean;
  attributes: PositionAttributes;
};

export type PositionAttributes = {
  address?: { category: string; type: string };
  device_plugged?: boolean;
  driver_token?: null;
  ignition?: boolean;
  is_cockpit_open?: boolean;
  obd_data?: {
    coolant_temp: number | null;
    fuel_level: number | null;
    fuel_level_amount: number | null;
    odometer: number | null;
    rpm: number | null;
    throttle: number | null;
  };
  original_attributes: Record<string, any>;
  original_speed: number | null;
  protocol: string;
  route_speed_limit: 60;
  unique_id: string | null;
  [key: string]: any;
};

export type Event = {
  id: string;
  reported_at: string;
  vehicle: Vehicle;
  driver: Driver | null;
  slug_name: EventSlugNameEnum;
  latitude: number;
  longitude: number;
  address: string;
  is_alarm: boolean;
  source: string;
  geofence_id: null;
  attributes: EventAttributes;
};

export type EventAttributes = {
  speed: number;
  course: number;
  original_type?: string;
  unique_id?: string;
  [key: string]: any;
};

export enum EventSlugNameEnum {
  driverChange = "driverChange",
  trailerOpen = "trailerOpen",
  cockpitDoorOpen = "cockpitDoorOpen",
  cockpitDoorClose = "cockpitDoorClose",
  geofenceEnter = "geofenceEnter",
  geofenceExit = "geofenceExit",
  ignitionOn = "ignitionOn",
  ignitionOff = "ignitionOff",
  deviceStopped = "deviceStopped",
  deviceMoving = "deviceMoving",
  deviceOverspeed = "deviceOverspeed",
  routeOverspeed = "routeOverspeed",
  hardBraking = "hardBraking",
  fault = "fault",
  hardCornering = "hardCornering",
  hardAcceleration = "hardAcceleration",
  deviceOverweight = "deviceOverweight",
  boardActivated = "boardActivated",
  boardDeactivated = "boardDeactivated",
  unplugged = "unplugged",
  plugged = "plugged",
}
