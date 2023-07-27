#!/bin/bash

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found in the current directory."
  exit 1
fi

# Parse package.json using jq (make sure jq is installed)
if ! command -v jq &>/dev/null; then
  echo "Error: jq is required but not installed. Please install jq and try again."
  exit 1
fi

# Extract package name and version using jq
package_name=$(jq -r '.name' package.json)
package_version=$(jq -r '.version' package.json)

# Create a new JSON file with package name and version
output_file="bin/minimal-package.json"
echo "{\"name\":\"$package_name\",\"version\":\"$package_version\"}" > "$output_file"

echo "Successfully created $output_file with package name and version."
