'use strict';

const fs = require('node:fs');

const tagVersion = process.env.RELEASE_TAG || process.env.GITHUB_REF_NAME;

if (!tagVersion) {
    throw new Error('RELEASE_TAG or GITHUB_REF_NAME is required.');
}

function normalizeVersion(version) {
    const parts = version.split('.');

    if (parts.length !== 3 || !parts.every((part) => /^\d+$/.test(part))) {
        throw new Error(`Version "${version}" must use numeric yyyy.mm.dd or semver-style major.minor.patch format.`);
    }

    return parts.map((part) => String(Number(part))).join('.');
}

const normalizedTagVersion = normalizeVersion(tagVersion);
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

console.log(`Release tag: ${tagVersion}`);
console.log(`Normalized release version: ${normalizedTagVersion}`);
console.log(`Package version: ${packageJson.version}`);

if (packageJson.version !== normalizedTagVersion) {
    packageJson.version = normalizedTagVersion;
    fs.writeFileSync('package.json', `${JSON.stringify(packageJson, null, '\t')}\n`);
    console.log(`Updated package.json version to ${normalizedTagVersion}`);
}

if (fs.existsSync('package-lock.json')) {
    const packageLock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
    let packageLockChanged = false;

    if (packageLock.version !== normalizedTagVersion) {
        packageLock.version = normalizedTagVersion;
        packageLockChanged = true;
    }

    if (packageLock.packages && packageLock.packages[''] && packageLock.packages[''].version !== normalizedTagVersion) {
        packageLock.packages[''].version = normalizedTagVersion;
        packageLockChanged = true;
    }

    if (packageLockChanged) {
        fs.writeFileSync('package-lock.json', `${JSON.stringify(packageLock, null, '\t')}\n`);
        console.log(`Updated package-lock.json version to ${normalizedTagVersion}`);
    }
}
