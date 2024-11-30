# Agedle (name is a work in progress)

A wordle-like game about guessing aoe 2 players.
---

## How to Play

1. Type in the player name (aliases such as "viper" for "TheViper" also work!)
2. An evaluation of the guess will appear
3. With this new information, make the next guess!

---

## Screenshots

### Example Screenshot
![Screenshot Description](#)

---

## Running the app

### Docker:
1. Clone the repository: `git clone https://github.com/termint0/age-wordle`
2. Navigate to the project directory: `cd age-wordle`
3. Compose the image `docker compose up` (will need `sudo` on linux)

### Flask (local use only):
1. Clone the repository: `git clone https://github.com/termint0/age-wordle`
2. Navigate to the project directory: `cd age-wordle`
3. Install the requirements: `pip install -r requirements.txt`
4. Run the app: `python3 src/app.py`
