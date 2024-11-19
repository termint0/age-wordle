import pandas as pd

df = pd.read_csv('./aoedle.csv', delimiter=";")
df["country"] = df["country"].replace("no", "Norway").replace("at", "Austria").replace("ca", "Canada")
df["teams"] =[[a.strip() for a in b.split(",")] for b in df["teams"]]
print(df.to_json(orient="records"))


