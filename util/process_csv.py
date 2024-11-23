import pandas as pd

df = pd.read_csv("./aoedle(1).csv", delimiter=";")
df = df.replace(pd.NA, -1)
print(df)
