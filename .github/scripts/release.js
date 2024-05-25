const jsonfile = require('jsonfile');
const fs = require('fs');
const path = require('path');

const packageFile = './package.json';
const packageData = jsonfile.readFileSync(packageFile);
const currentVersion = packageData.version;
const authorName = packageData.author;
const versionParts = currentVersion.split('.');
let [major, minor, patch] = versionParts.map(Number);
const incrementType = process.argv[2];
switch (incrementType) {
    case '-minor':
        minor += 1;
        patch = 0;
        break;
    case '-patch':
        patch += 1;
        break;
    case '-major':
        major += 1;
        minor = 0;
        patch = 0;
        break;
    default:
        console.log('Invalid increment type. Please use -minor, -patch, or -major.');
        process.exit(1);
}
const newVersion = `${major}.${minor}.${patch}`;
packageData.version = newVersion;
jsonfile.writeFileSync(packageFile, packageData, { spaces: 2 });

const filesToUpdate = [
    "./dist/docsify-auto-headers.js",
    "./dist/docsify-auto-headers.min.js"
];

filesToUpdate.forEach(filePath => {
    const fileName = getFileName(filePath);
    const header = `/*! ${fileName} ${newVersion} | (c) ${authorName} */\n`;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const headerRegex = /^\/\*![\s\S]*?\*\//; // Regular expression to match the header comment
    const contentWithoutHeader = fileContent.replace(headerRegex, '');
    const updatedContent = header + contentWithoutHeader.trimStart();
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Header added to ${filePath}.`);
});

console.log('Header added successfully to all files.');

const changelogPath = './CHANGELOG.md';
const changelogContent = generateChangelog(newVersion, incrementType);
fs.writeFileSync(changelogPath, changelogContent, 'utf8');
console.log('Changelog generated successfully.');

function generateChangelog(version, incrementType) {
    const currentDate = new Date().toDateString();
    const changeDescription = getChangeDescription(incrementType);

    // Read the existing changelog content if it exists
    let existingChangelog = '';
    if (fs.existsSync(changelogPath)) {
        existingChangelog = fs.readFileSync(changelogPath, 'utf8');
    }
    const newChangelogEntry = `\n## ${version} - ${currentDate}\n\n${changeDescription}\n`;
    return newChangelogEntry + existingChangelog;
}

function getChangeDescription(incrementType) {
    switch (incrementType) {
        case '-minor':
            return '### Added\n\n- Add your change description here.';
        case '-patch':
            return '### Fixed\n\n- Fix your change description here.';
        case '-major':
            return '### Breaking Changes\n\n- Describe any breaking changes here.';
        default:
            return '';
    }
}

function getFileName(filePath) {
    const fileNameWithExtension = path.basename(filePath);
    const fileName = fileNameWithExtension.split('.')[0];
    return fileName;
}
