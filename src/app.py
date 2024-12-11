import logging
import random
from threading import Thread
from multiprocessing import Value
import time
import flask
import schedule
import os

# ensures the hash function behaves the same across threads
os.environ["PYTHONHASHSEED"] = str(random.randint(0, 4294967295))

from age_game import (
    Game,
    correct_guesses,
    get_goal_player_lengths,
)


def schedule_loop():
    while True:
        schedule.run_pending()
        time.sleep(1)


logging.info("Creating player change scheduler")

schedule_thread = Thread(target=schedule_loop)
schedule_thread.start()

app = flask.Flask(__name__)


logging.info("Creating Game instance")

game = Game()
game.change_player()

schedule.every().day.at("04:00", "UTC").do(game.change_player)

attempts = Value("i", 0)


@app.route("/api/log-start", methods=["POST"])
def log_start():
    global attempts
    attempts.value += 1
    return ""


@app.route("/api/guesses-today")
def get_correct_guesses():
    return flask.jsonify({"count": correct_guesses.value})


@app.route("/api/attempts-today")
def get_attempts():
    return flask.jsonify({"count": attempts.value})


@app.route("/api/goal-player-info")
def get_goal_player_info():
    curr = game.get_current_player()
    player_info = get_goal_player_lengths(curr)
    return flask.jsonify(player_info)


@app.route(
    "/api/hash",
)
def getHash():
    return flask.jsonify({"hash": game.get_hash()})


@app.route(
    "/api/guess/<name>",
)
def guess(name: str):
    # start_time = time.process_time()
    response = game.guess(name)
    if response is None:
        return flask.jsonify(error="Player not found"), 404

    correct_guesses.value += response["correct"]
    # print((time.process_time() - start_time))
    return flask.jsonify(response)


@app.route(
    "/api/hint/<key>",
)
def hint(key: str):
    val = game.get_current_player().get(key)
    return flask.jsonify({"value": val})


@app.route("/api/give-up")
def give_up():
    return flask.jsonify(game.get_current_player())


if __name__ == "__main__":

    @app.route("/")
    def index():
        return flask.render_template("index.html")

    @app.route("/about")
    def about():
        return flask.render_template("about.html")

    app.run(host="0.0.0.0", port=8080, debug=True)

# print(get_guess_info("TheViper"))
