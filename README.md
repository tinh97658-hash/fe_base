# SHCD Quiz Application

## Setup and Running

1. Install dependencies:
```
npm install
npm install json-server
```

2. Start JSON Server (in one terminal):
```
npm run server
```

3. Start React app (in another terminal):
```
npm start
```

## Important Notes

- Make sure JSON Server is running on port 3001 before starting the React app
- The db.json file is located in the public folder so it can be accessed directly by the app if JSON Server fails
- If you make changes to db.json, restart the JSON Server
