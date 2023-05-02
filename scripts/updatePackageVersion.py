import os
import sys
import json
import semver
from datetime import date

# Parse command line arguments
if len(sys.argv) < 5:
    print(
        "Usage: python updatePackages.py <packageDir> <versionType> <changelogHeader> <changelogMessage> [specificPackages...]")
    sys.exit(1)

package_dir = sys.argv[1]
version_type = sys.argv[2]
changelog_header = sys.argv[3]
changelog_message = sys.argv[4]
specific_packages = sys.argv[5:] if len(sys.argv) > 5 else []

# Open output file to write to
with open("output.txt", "w") as output_file:

    # Loop through all packages in the directory
    for package_name in os.listdir(package_dir):
        package_dir_path = os.path.join(package_dir, package_name)
        if not os.path.isdir(package_dir_path):
            continue

        # Extract the package name from the directory name
        package_base_name = package_name.split("-")[1]

        if specific_packages and package_base_name not in specific_packages:
            continue

        # Read the package's version from the package.json file
        package_json_file = os.path.join(package_dir_path, "package.json")
        with open(package_json_file, "r") as f:
            package_json = json.load(f)
            current_version = package_json["version"]

        # Bump the version using semver
        if version_type == "major":
            new_version = semver.bump_major(current_version)
        elif version_type == "minor":
            new_version = semver.bump_minor(current_version)
        elif version_type == "patch":
            new_version = semver.bump_patch(current_version)
        else:
            output_file.write(
                "Invalid version type specified. Please use 'major', 'minor', or 'patch'\n")
            continue

        # Update the package.json file with the new version
        package_json["version"] = new_version
        with open(package_json_file, "w") as f:
            json.dump(package_json, f, indent=2)

        # Update the change log with the custom message as the first entry
        changelog_file = os.path.join(package_dir_path, "CHANGELOG.md")
        with open(changelog_file, "r") as f:
            changelog = f.readlines()

        # Calculate the number of lines added
        num_lines_added = 3  # "#vX.X.X", "##Header", "- Custom Message"
        # Insert the custom change log entry at the beginning of the file
        changelog = [f"# v{new_version} ({date.today().isoformat()})\n\n",
                     f"## {changelog_header}\n\n", f"- {changelog_message}\n\n"] + changelog

        with open(changelog_file, "w") as f:
            f.writelines(changelog)

        output_file.write(
            f"yarn updateDeps {package_name} {new_version}\n")
