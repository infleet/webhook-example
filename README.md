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
      "ignition": false, // Vehicle ignition status
      "unique_id": "358735073823063", // Device IMEI
      "driver_token": "271377231923726", // iButton
      "altitude_accuracy": 24.8, // Unit in meters (m) for altitude precision
      "route_speed_limit": 80.0, // Unit in km/h, this speed is defined by: https://wiki.openstreetmap.org/wiki/OSM_tags_for_routing/Maxspeed#Brazil
      "original_attributes": {
        // ... all other extra attributes provided by the gateway/device
      },
      "address": {
        "category": "highway",
        "type": "residential"
      },
      "odometer": 150.2638702011607 // Odometer considered on the system
    },
    "vehicle": {
      "id": "44dfd5cd-9f2f-449e-a5f5-769b5adfef34",
      "plate": "JDO8A24",
      "type": "bus" // bus, truck, car, motorcycle, trailer, garbage_collector
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
    "course": 132, // Range of 0° - 360°
    "speed": 0, // Unit in km/h
    // The driver could be `null` also
    "driver": {
      "id": "6c466f6c-37d9-47a5-9c5c-98d9e4cf2ceb",
      "name": "Motorista 01"
    },
    "source": "apollo", // hermes or apollo -- apollo -> cellphone position; hermes --> tracker position
    "vehicle": {
      "id": "ac715b10-3142-4af2-bd91-08168723bd16",
      "plate": "PLA0001",
      "type": "truck" // bus, truck, car, motorcycle, trailer, garbage_collector
    },
    "attributes": {
      "course": 132,
      "original_type": "ignitionOff",
      "speed": 0,
      "unique_id": "358735073823063"
    }
  }
}
```

PS.: When the vehicle `type` states _equipment,_ instead of `odometer` , `horimeter` measure is
sent and incremented with time

### Events

| Slug name             | Has `is_initial` state attribute | Description                    |
| --------------------- | :------------------------------: | ------------------------------ |
| `trailerOpen`         |               [ ]                | Abertura do baú                |
| `cockpitDoorOpen`     |               [ ]                | Abertura da cabine             |
| `hardAcceleration`    |               [ ]                | Aceleração brusca              |
| `boardActivated`      |               [ ]                | Acionamento ativado            |
| `boardDeactivated`    |               [ ]                | Acionamento desativado         |
| `hardCornering`       |               [ ]                | Curva acentuada                |
| `plugged`             |               [ ]                | Dispositivo conectado          |
| `unplugged`           |               [ ]                | Dispositivo desconectado       |
| `geofenceEnter`       |               [ ]                | Entrou na cerca                |
| `deviceOverspeed`     |               [x]                | Excesso de velocidade          |
| `routeOverspeed`      |               [x]                | Excesso de velocidade na via   |
| `fault`               |               [ ]                | Falha                          |
| `cockpitDoorClose`    |               [ ]                | Fechamento da cabine           |
| `hardBraking`         |               [ ]                | Frenagem brusca                |
| `deviceMoving`        |               [ ]                | Movimento                      |
| `deviceStopped`       |               [ ]                | Parada                         |
| `geofenceExit`        |               [ ]                | Saiu da cerca                  |
| `deviceOverweight`    |               [ ]                | Sobrepeso                      |
| `driverChange`        |               [ ]                | Troca de motorista             |
| `ignitionOff`         |               [ ]                | Veículo desligado              |
| `ignitionOn`          |               [ ]                | Veículo ligado                 |
| `simCardExceeded`     |               [ ]                | Excesso de tráfego no SIM Card |
| `rebooting`           |               [ ]                | Restart                        |
| `mainCameraError`     |               [ ]                | Erro câmera 1                  | 
| `secondaryCameraError`|               [ ]                | Erro câmera 2                  |
| `simCardError`        |               [ ]                | Erro no SIM Card               |
| `powerCut`            |               [ ]                | Corte de energia               |
| `newDriver`           |               [ ]                | Novo motorista                 |
| `missingUSBCamera`    |               [ ]                | Sem câmera USB                 |
| `collisionRisk`       |               [ ]                | Risco de colisão               |
| `fuelCut`             |               [ ]                | Corte de combustível           |
| `parkingMode`         |               [ ]                | Modo estacionamento            |
| `missingDriver`       |               [ ]                | Sem motorista                  |
| `recordActive`        |               [ ]                | Captura ativa                  |
| `fatigue`             |               [ ]                | Fadiga                         |
| `usingPhone`          |               [ ]                | Celular                        |
| `smoking`             |               [ ]                | Fumo                           |
| `distraction`         |               [ ]                | Distração                      |
| `yamning`             |               [ ]                | Bocejo                         |

When the event does have the attribute `is_initial` and the value is equal to `false`,
the event payload will have some additional information, like: `duration`, `distance`,
`avg_speed`, `max_speed`. The most common filled is `duration`.
