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
    res.sendFile(path.join(__dirname, 'views', 'index.js'));    
});

app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'style.css'));    
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'summary.html'));
});

app.get('/summary', (req, res) => {
    console.log('start')
    res.render('summary');
});

function readDirectory(dir, fileList = []) {
    const files = fs.readdirSync(dir);  
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        fileList.push(filePath);
        // if (stat.isDirectory()) {
        //     readDirectory(filePath, fileList);
        // } else {
        //     fileList.push(filePath);
        // }
    });
    return fileList;
}


const directoryPath = './data';

app.get('/jsondata', (req, res) => {
    const fileList = readDirectory(directoryPath);

    //const mdFiles = fileList.filter(file => path.extname(file) === '.md');

    const jsonData = { files: fileList };
    fs.writeFileSync(path.join(__dirname,'markdown-driver.json'), JSON.stringify(jsonData, null, 2));
    res.json(jsonData);
   
});

app.get('/filecontent', (req, res) => {
    const directoryPath = path.join(__dirname, req.query.file);
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            res.status(500).send('Error reading directory');
            return;
        }
        res.json(files);
    });
});

app.get('/mdcontent', (req, res) => {
   // console.log(req.query.file)
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

