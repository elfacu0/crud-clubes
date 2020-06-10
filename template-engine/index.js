const fs = require('fs');
const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

// const upload = multer({ dest: './public/uploads/images' });
const upload = multer({ dest: './public/uploads/images' });
const exphbs = require('express-handlebars');

const PORT = 8080;
const app = express();
const hbs = exphbs.create();

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// esto define que el directorio /uploads contiene assets estáticos,
// que se deben servir tal cual están
// notar que no hace falta ir a localhost:8080/uploads
// https://expressjs.com/en/starter/static-files.html
// app.use(express.static(`${__dirname}/uploads`));

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

function selectTeam(teams, id, index = false) {
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].id === Number(id)) {
            if (!index) {
                return teams[i];
            } else {
                return i;
            }
        }
    }
}

app.get('/', (req, res) => {
    const teams = JSON.parse(fs.readFileSync('./data/equipos.json'));
    res.render('home', {
        layout: 'main',
        data: {
            teams,
        },
    });
});

app.get('/team/add', (req, res) => {
    res.render('editTeam', {
        layout: 'main',
        title: 'Add Team',
        data: {
            id: 0,
        },
    });
});

app.get('/team/:id/view', (req, res) => {
    const teams = JSON.parse(fs.readFileSync('./data/equipos.json'));
    const team = selectTeam(teams, req.params.id, false);
    console.log(team);
    res.render('team', {
        layout: 'main',
        title: team.name,
        data: { id: req.params.id, team },
    });
});

app.get('/team/:id/delete', (req, res) => {
    const teams = JSON.parse(fs.readFileSync('./data/equipos.json'));
    const team = selectTeam(teams, req.params.id, false);
    res.render('checkBox', {
        layout: 'main',
        title: 'Delete',
        data: {
            id: req.params.id,
            team,
        },
    });
});

app.post('/team/:id/delete', (req, res) => {
    deleteTeam(req.params.id);
    res.redirect('/');
});

app.get('/team/:id/edit', (req, res) => {
    const teams = JSON.parse(fs.readFileSync('./data/equipos.json'));
    const team = selectTeam(teams, req.params.id, false);
    res.render('editTeam', {
        layout: 'main',
        title: team.name,
        data: { id: req.params.id, team },
    });
});

app.post('/team/:id/edit', (req, res) => {
    const teams = JSON.parse(fs.readFileSync('./data/equipos.json'));
    const team = selectTeam(teams, req.params.id, false);
    modifyTeam(req.body, req.params.id);
    res.redirect('/');
});

function modifyTeam(changes, id) {
    const teams = JSON.parse(fs.readFileSync('./data/equipos.json'));
    const index = selectTeam(teams, id, true);
    if (id !== 'new') {
        for (let [key, value] of Object.entries(changes)) {
            teams[index][key] = value;
        }
    } else {
        let team = {};
        for (let [key, value] of Object.entries(changes)) {
            team[key] = value;
        }
        teams.push(team);
    }
    fs.writeFileSync('./data/equipos.json', JSON.stringify(teams, null, 4));
}

app.post('/upload/:id', upload.single('image'), (req, res) => {
    const file = req.file;
    if (!file) {
        res.send('Upload failed');
        const error = new Error('Please upload a file');
        error.httpStatusCode = 400;
        return next(error);
    }
    const fileName = file.destination.slice(8) + '/' + file.filename;
    changeCrest(fileName, req.params.id);
    res.send('upload successful');
    res.redirect('/');
});

function changeCrest(filePath, id) {
    const teams = JSON.parse(fs.readFileSync('./data/equipos.json'));
    const index = selectTeam(teams, id, true);
    teams[index].crestUrl = filePath;
    fs.writeFileSync('./data/equipos.json', JSON.stringify(teams, null, 4));
}

function deleteTeam(id) {
    let teams = JSON.parse(fs.readFileSync('./data/equipos.json'));
    teams = teams.filter((e) => e.id != id);
    fs.writeFileSync('./data/equipos.json', JSON.stringify(teams, null, 4));
}

app.listen(PORT);
