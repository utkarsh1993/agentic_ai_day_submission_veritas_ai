from .agent import execute

async def run(payload):
    return await execute(payload)
    # 👀 Print what the host agent is sending
    # print("🚀 Incoming payload:", payload)
    data = payload['newMessage']['parts'][0]['images'][0]
    print(payload['newMessage']['parts'][0]['images'])
    # print(data)
    # return await execute(data)
