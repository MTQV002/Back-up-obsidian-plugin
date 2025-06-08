import { readFileSync, writeFileSync } from "fs";

// Get version from package.json or environment
const targetVersion = process.env.npm_package_version || "2.1.0";

console.log(`Updating version to: ${targetVersion}`);

try {
    // Update manifest.json
    let manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
    const { minAppVersion } = manifest;
    manifest.version = targetVersion;
    writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t"));
    console.log(`✅ Updated manifest.json to version ${targetVersion}`);

    // Create or update versions.json
    let versions = {};
    try {
        versions = JSON.parse(readFileSync("versions.json", "utf8"));
    } catch (error) {
        console.log("Creating new versions.json file");
    }
    
    versions[targetVersion] = minAppVersion;
    writeFileSync("versions.json", JSON.stringify(versions, null, "\t"));
    console.log(`✅ Updated versions.json with ${targetVersion}: ${minAppVersion}`);

    console.log(`🎉 Successfully updated to version ${targetVersion}`);
} catch (error) {
    console.error('❌ Error updating version:', error);
    process.exit(1);
}
