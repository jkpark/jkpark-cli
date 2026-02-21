from binance import Client
import os

client = Client() # Public API doesn't require keys

# Fetch 1 minute klines for the last day
klines = client.get_historical_klines("BTCUSDT", Client.KLINE_INTERVAL_1MINUTE, "1 day ago UTC")

# kline format:
# [
#   [
#     1499040000000,      # Open time
#     "0.01634790",       # Open
#     "0.80000000",       # High
#     "0.01575800",       # Low
#     "0.01577100",       # Close
#     "148976.11427815",  # Volume
#     1499644799999,      # Close time
#     "2434.19055334",    # Quote asset volume
#     308,                # Number of trades
#     "1756.87402397",    # Taker buy base asset volume
#     "28.46694368",      # Taker buy quote asset volume
#     "17928899.62484339" # Ignore
#   ]
# ]

for k in klines[:5]:
    print(f"Time: {k[0]}, Open: {k[1]}, Close: {k[4]}")
