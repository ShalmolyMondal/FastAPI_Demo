from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import json
import time
import skfuzzy as skf


app = FastAPI()  # creating API object

app.add_middleware(  # to communicate between react running on 3000 and BE running on 8000
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/websocket")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = json.loads(await websocket.receive_text())
        speed_data = data["speed"]
        density_data = data["density"]
        rand_speed = list(
            np.random.randint(speed_data["lower"], speed_data["upper"], size=1)
        )[0]
        rand_density = list(
            np.random.randint(density_data["lower"], density_data["upper"], size=1)
        )[0]

        membership_speed = skf.trapmf(np.array([rand_speed]), [18, 20, 35, 40])
        membership_density = skf.trapmf(np.array([rand_density]), [18, 20, 35, 40])

        certainity = list(membership_speed)[0] * 0.5 + list(membership_density)[0] * 0.5
        timestamp = time.time()
        result = {
            "timestamp": timestamp,
            "Speed": rand_speed,
            "Density": rand_density,
            "certainity": certainity,
        }
        await websocket.send_text(f"{result}")
