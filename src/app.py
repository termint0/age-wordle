import logging
import random 
from threading import Thread
from multiprocessing import Value
import time
import flask
import schedule
import os

# ensures the hash function behaves the same across threads
os.environ["PYTHONHASHSEED"] = str(random.randint(-(10 ** 9), 10 ** 9))

from age_game import (
    Game,
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


correct_guesses = Value("i", 0)


@app.route("/api/guesses-today")
def get_correct_guesses():
    return flask.jsonify({"count": correct_guesses.value})


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


@app.route("/api/multiguess")
def multiguess():
    names = flask.request.args.get("names")
    if names is None:
        return flask.jsonify("Player not found", 404)
    names = names.split(",")
    response = [game.guess(name) for name in names]
    response = [x for x in response if x]

    return flask.jsonify(response)


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
