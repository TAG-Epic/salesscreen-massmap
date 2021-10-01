import pandas as pd
df = pd.read_excel("./in.xlsx")
df.to_csv("./out.csv", sep=",", columns=["Email", "External ID", "System"], index=False)

