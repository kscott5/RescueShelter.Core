var db = db.getSiblingDB('rescueshelter')

db.createUser({
    'user': 'analyst',
    'pwd': passwordPrompt(),
    'roles': ['read']
})

db.createUser({
    'user': 'manager',
    'pwd': passwordPrompt(),
    'roles': ['readWrite']
})