const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');

app.use(express.urlencoded({ extended: true }));
//app.set('view engine', 'ejs');
//app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));

app.use(bodyParser.json());
app.get('/index.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'scripts', 'index.js'));    
});
app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));    
});

app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'));    
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index', (req, res) => {
    console.log('start')
    res.render('summary');
});

const readDirectory = (dirPath) => {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    let structure = [];

    entries.forEach(entry => {
        const entryPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            structure.push({
                folder: entryPath,
                contents: readDirectory(entryPath)
            });
        } else {
            const fileObject = structure.find(item => item.folder === 'files');
            if (!fileObject) {
                structure.push({
                    folder: 'files',
                    contents: [entry.name]
                });
            } else {
                fileObject.contents.push(entry.name);
            }
        }
    });

    return structure;
};

const directoryPath = './data';


app.get('/jsondata', (req, res) => {
    const fileList = readDirectory(directoryPath);

    //const mdFiles = fileList.filter(file => path.extname(file) === '.md');

    const jsonData = fileList;
    fs.writeFileSync(path.join(__dirname,'markdown-driver.json'), JSON.stringify(jsonData, null, 2));
    res.json(jsonData);
   
});



app.get('/mdcontent', (req, res) => {
   //console.log(req.query.file)
    //const directoryPath = path.join(__dirname, req.query.file);
    const filePath = path.join(__dirname, req.query.file);
    const fileList = []
    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading file');
            return;
        }
        fileList.push(content)
        res.json(fileList);
    });
});


app.post('/save', (req, res) => {
    
    const jsonData = req.body;
    //console.log(jsonData)
    let markdownContent = '';

    jsonData.forEach(section => {
        markdownContent += `# ${section.header}\n`;
        section.items.forEach(item => {
            markdownContent += `* ${item}\n`;
        });
    });

    fs.writeFileSync(path.join(__dirname,'Output', 'output.md'), markdownContent);

    res.send('Data saved successfully');
});

app.post('/draft', (req, res) => {
    
    const jsonData = req.body;
    //console.log(jsonData)
    
    fs.writeFileSync(path.join(__dirname,'Drafts', 'draft.json'), JSON.stringify(jsonData, null, 2));

    res.send('Data saved in draft');
});

app.get('/load-draft', (req, res) => {
    if (fs.existsSync(path.join(__dirname,'Drafts', 'draft.json'))) {
        const jsonData = fs.readFileSync(path.join(__dirname,'Drafts', 'draft.json'), 'utf8');
        res.json(JSON.parse(jsonData));
    } else {
        res.json([]);
    }
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

