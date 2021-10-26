set positional-arguments

install:
    npm install

clean: 
    rm -rf dist
    mkdir -p dist

build:
    #!/bin/bash
    npx tsc
    version=$(cat package.json | jq -r '.version | split(".") | { Major: .[0], Minor: .[1], Patch: .[2]}')
    cat src/resources/task.json | jq -r --argjson version "$version" ' .version |= $version ' > dist/task.json
    cat src/resources/vss-extension.json | jq -r --argjson version "$version" ' .version |= $version ' > dist/vss-extension.json

version version="patch":
    npm version {{ version }}

package:
    npx tfx extension --manifest-globs dist/vss-extension.json create

publish version="minor": (version version)
    npx tfx extension \
        --manifest-globs dist/vss-extension.json \
        --auth-type pat \
        --no-prompt -t $AZURE_DEVOPS_PAT \
        -u https://marketplace.visualstudio.com \
        publish

release version="minor": clean (version version) install build package

run:
    node dist/index.js