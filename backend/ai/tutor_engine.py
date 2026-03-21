
import random, json, os

DATA = os.path.join(os.path.dirname(__file__),"../../datasets")

def tutor_response(topic):

    if topic=="c":
        with open(os.path.join(DATA,"c_lessons.json")) as f:
            data=json.load(f)
        return random.choice(list(data.values()))

    if topic=="kravmaga":
        techniques=[
        "360 defense",
        "Front choke escape",
        "Knife redirect",
        "Bear hug counter"
        ]
        return random.choice(techniques)

    if topic=="workout":
        workouts=[
        "Bench Press 4x8",
        "Squat 5x5",
        "Deadlift 5x5",
        "Pullups 3x12"
        ]
        return random.choice(workouts)

    if topic=="dhikr":
        with open(os.path.join(DATA,"adhkar.json")) as f:
            dhikr=json.load(f)
        return random.choice(dhikr)

    return "Unknown topic"
