# Infleet Webhook - Get Started

Delivery data by _webhook_ to our customers that was configured correctly
in the organization panel. This will deliver all related data with `positions`
and `events`.

## Run

```bash
$ docker build -t infleet-webhook .
$ docker run --rm -e MY_API_TOKEN="Id+vAd9cySZmzHgIxLstz+EmQUt0i3QndZwaa5yj/0ZjoDlRNELznQwN88je6iXa" -e PORT=5001 -p "5001:5001" infleet-webhook
```

## Server requirements for receive the message

- Send a response before than 3 seconds.
- Send a response with status code `>= 200` and `< 300`.
- Deal with data duplications when they occur.

## Setup

To configure the _webhook_ integration you must go to the organization panel and
configure your endpoint in headers. Before that, you must have a public endpoint
with some authorization strategy based on the use of http headers or querystring
parameters. We will send the data to this endpoint, you app should always
respond before **3 seconds** and send a successfully status code, eg: `200`, `201`.
By sending this response, we will assume that you already received the data.
If you take too long to respond we'll close the request and try again and again...
for **3 days**, after that your data will be lost.
Our delivery mode use the strategy **at least once**, so you must implement a way
to avoid duplication.
Both data: `position` and `event` will always have the `vehicle` property filled,
but the `driver` property will be populated when the event occurs when a driver
is linked to the vehicle.

## Message structure

The base data payload sent by us will have 2 basic attributes: `type` and `data`.
The `type` field describes what data you are receiving and the `data` will have
the data content described in the documents below.

**Example**

```ts
type Payload {
  type: "position" | "event" | string,
  data: Record<string, unknown>
}
```

## Position

**Example**

```json
{
  "type": "position",
  "data": {
    "id": "3ebd099a-b32c-40f2-b3c8-f6f432108538",
    "source": "apollo", // hermes or apollo -- apollo -> cellphone position; hermes --> tracker position
    "fix_time": "2021-10-11T13:45:14.000+00:00", // Time GPS captured the data. Recommended usage to track
    "server_time": "2021-10-11T19:27:07.089+00:00", // Time data arrived on server
    "device_time": "2021-10-11T13:45:14.000+00:00", // Time set on device when data was generated
    "valid": true, // True or False. Depends on the network connectivity status.
    "address": "Rua Baviera, São José dos Campos, São Paulo, Brasil",
    "altitude": 585.6,
    "latitude": -23.1823789,
    "longitude": -45.8260266,
    "speed": 20.0, // Unit in km/h
    "course": 358.18, // Range of 0° - 360°
    "accuracy": 16.2, // Radius value for precision in meters (m)
    "attributes": {
      "ignition": false, // Vehicle ignition status Or NULL
      "unique_id": "358735073823063", // Device IMEI Or NULL
      "driver_token": "271377231923726", // iButton Or NULL
      "altitude_accuracy": 24.8, // Unit in meters (m) for altitude precision Or NULL
      "route_speed_limit": 80.0, // Unit in km/h, this speed is defined by: https://wiki.openstreetmap.org/wiki/OSM_tags_for_routing/Maxspeed#Brazil Or NULL
      "original_attributes": {
        // ... all other extra attributes provided by the gateway/device
      }, // JSON Or NULL
      "address": {
        "category": "highway",
        "type": "residential"
      }, // JSON Or NULL
      "odometer": 150.2638702011607 // Odometer considered on the system Or NULL
    },
    "vehicle": {
      "id": "44dfd5cd-9f2f-449e-a5f5-769b5adfef34",
      "plate": "JDO8A24",
      "type": "bus" // bus, truck, car, motorcycle, trailer, garbage_collector, equipment
    },
    "driver": {
      "id": "6c466f6c-37d9-47a5-9c5c-98d9e4cf2ceb",
      "name": "Motorista 01"
    }
  }
}
```

## Event

**Example**

```json
{
  "type": "event",
  "data": {
    "id": "1c7d46ef-bdb8-4baa-9b44-391ad09e55d8",
    "reported_at": "2022-11-21T17:42:42Z", // Time GPS captured the data. Recommended usage to track
    "address": "Rua Padre Camilo Torrend, Salvador, Bahia, Brasil",
    "latitude": -13.001733333333334,
    "longitude": -38.511248888888886,
    "slug_name": "ignitionOff",
    "course": 132, // Range of 0° - 360° OR Null
    "speed": 0, // Unit in km/h OR Null
    // The driver could be `null` also
    "driver": {
      "id": "6c466f6c-37d9-47a5-9c5c-98d9e4cf2ceb",
      "name": "Motorista 01"
    },
    "source": "apollo", // hermes or apollo -- apollo -> cellphone position; hermes --> tracker position
    "vehicle": {
      "id": "ac715b10-3142-4af2-bd91-08168723bd16",
      "plate": "PLA0001",
      "type": "truck" // bus, truck, car, motorcycle, trailer, garbage_collector, equipment
    },
    "attributes": {
      // DEPRECATED: use `medias` instead. Kept for backward compatibility, could be Null
      "media": {
        "camera": 1,
        "file_name": "EVENT_358735073823063_00000000_2024_01_26_20_15_06_51.mp4",
        "file_type": "mp4"
      },
      // available for certain events when the device is a camera, this could be Null
      "medias": [
        {
          "camera": 1,
          "file_name": "EVENT_358735073823063_00000000_2024_01_26_20_15_06_51.mp4",
          "file_type": "mp4"
        },
        {
          "camera": 2,
          "file_name": "EVENT_358735073823063_00000000_2024_01_26_20_15_06_52.mp4",
          "file_type": "mp4"
        }
      ],
      "course": 132, // Or NULL
      "original_type": "ignitionOff", // Or NULL
      "speed": 0, // Or NULL
      "unique_id": "358735073823063", // Or NULL
      "geofence_name": "Sector A" // available to events geofenceEnter, geofenceExit Or NULL
    }
  }
}
```

PS.: When the vehicle `type` states _equipment,_ instead of `odometer` , `horimeter` measure is
sent and incremented with time

### Media URL

To access the event media, you should construct the following URL:

```
https://api.infleet.com.br/v1/vehicles/[VEHICLE_ID]/events/[EVENT_ID]/medias/[FILE_NAME]
```

You should replace VEHICLE_ID, EVENT_ID, FILE_NAME with the values present inside the payload that you received.

### Events

The table below reflects the current event catalog of the platform. The actual
set of events your organization receives depends on the equipment installed in
each vehicle (tracker, camera, DMS/ADAS support, CAN bus).

#### Telemetry

| Slug name            | Has `is_initial` state attribute | Description                    |
| -------------------- | :------------------------------: | ------------------------------ |
| `trailerOpen`        |               [ ]                | Abertura do baú                |
| `cockpitDoorOpen`    |               [ ]                | Abertura da cabine             |
| `cockpitDoorClose`   |               [ ]                | Fechamento da cabine           |
| `geofenceEnter`      |               [ ]                | Entrou na cerca                |
| `geofenceExit`       |               [ ]                | Saiu da cerca                  |
| `ignitionOn`         |               [ ]                | Veículo ligado                 |
| `ignitionOff`        |               [ ]                | Veículo desligado              |
| `deviceOnline`       |               [ ]                | Equipamento conectado          |
| `deviceOffline`      |               [ ]                | Equipamento desconectado       |
| `deviceStopped`      |               [ ]                | Parada / Parada fora da cerca  |
| `deviceMoving`       |               [ ]                | Movimento                      |
| `deviceOverspeed`    |               [x]                | Excesso de velocidade          |
| `routeOverspeed`     |               [x]                | Excesso de velocidade na via   |
| `geofenceOverspeed`  |               [x]                | Excesso de velocidade na cerca |
| `deviceIdle`         |               [x]                | Marcha lenta excessiva         |
| `deviceOverweight`   |               [ ]                | Sobrepeso                      |
| `boardActivated`     |               [ ]                | Acionamento ativado            |
| `boardDeactivated`   |               [ ]                | Acionamento desativado         |
| `plugged`            |               [ ]                | Dispositivo conectado          |
| `hardAcceleration`   |               [ ]                | Aceleração brusca              |
| `hardBraking`        |               [ ]                | Frenagem brusca                |
| `hardCornering`      |               [ ]                | Curva acentuada                |

#### Camera / video telemetry

| Slug name         | Has `is_initial` state attribute | Description             |
| ----------------- | :------------------------------: | ----------------------- |
| `cameraCovered`   |               [ ]                | Câmera coberta          |
| `memoryCardFull`  |               [ ]                | Cartão de memória cheio |
| `noMemoryCard`    |               [ ]                | Sem cartão de memória   |
| `lowVoltage`      |               [ ]                | Bateria baixa           |
| `powerCut`        |               [ ]                | Bloqueio do veículo     |
| `requestedVideo`  |               [ ]                | Vídeo solicitado        |
| `unplugged`       |               [ ]                | Dispositivo removido    |
| `missingDriver`   |               [ ]                | Sem motorista           |

#### DMS (driver monitoring)

| Slug name         | Has `is_initial` state attribute | Description           |
| ----------------- | :------------------------------: | --------------------- |
| `fatigue`         |               [ ]                | Fadiga                |
| `usingPhone`      |               [ ]                | Celular               |
| `smoking`         |               [ ]                | Fumo                  |
| `distraction`     |               [ ]                | Distração             |
| `yawning`         |               [ ]                | Bocejo                |
| `lookingDown`     |               [ ]                | Olhou para baixo      |
| `eyesClosed`      |               [ ]                | Olhos fechados        |
| `faceRecognition` |               [ ]                | Reconhecimento facial |

#### ADAS

| Slug name          | Has `is_initial` state attribute | Description                      |
| ------------------ | :------------------------------: | -------------------------------- |
| `laneDeparture`    |               [ ]                | Mudança de faixa                 |
| `forwardCollision` |               [ ]                | Risco de colisão                 |
| `vehicleTooClose`  |               [ ]                | Proximidade do veículo dianteiro |
| `seatbeltUnbuckled`|               [ ]                | Sem cinto de segurança           |
| `videoLoss`        |               [ ]                | Perda de vídeo                   |
| `rollover`         |               [ ]                | Capotamento                      |

#### CAN bus

| Slug name         | Has `is_initial` state attribute | Description             |
| ----------------- | :------------------------------: | ----------------------- |
| `rpmRedLane`      |               [x]                | Faixa vermelha de RPM   |
| `rpmCoastingLane` |               [x]                | Movimentação em banguela|

Events flagged with `is_initial` are delivered in pairs: one message marking
the start (`is_initial: true`) and one marking the end (`is_initial: false`).
When the event does have the attribute `is_initial` and the value is equal to `false`,
the event payload will have some additional information, like: `duration`, `distance`,
`avg_speed`, `max_speed`. The most common filled is `duration`.

#### Removed events

The following slugs were part of older versions of this catalog and are no
longer emitted by the platform: `collisionRisk` (replaced by `forwardCollision`),
`driverChange`, `newDriver`, `fault`, `fuelCut`, `mainCameraError`,
`secondaryCameraError`, `missingUSBCamera`, `recordActive`, `rebooting`,
`simCardError`, `simCardExceeded`, `parkingMode` and `stoppedOutsideGeofence`
(replaced by `deviceStopped` outside a geofence).
