set positional-arguments

install:
    npm ci

clean: 
    rm -rf dist
    mkdir -p dist

build:
    #!/bin/bash
    npx tsc
    version=$(cat package.json | jq -r '.version | split(".") | { Major: .[0], Minor: .[1], Patch: .[2]}')
    cat <<< $(jq --argjson version "$version" ' .version |= $version ' src/resources/task.json) > dist/task.json

version version="patch":
    #!/bin/bash
    npm --no-git-tag-version version {{ version }}
    parsed=$(cat package.json | jq -r '.version')
    cat <<< $(jq --arg version "$parsed" ' .version = $version ' vss-extension.json) > vss-extension.json

package:
    npx tfx extension create --output-path dist/ext --manifest-globs vss-extension.json

publish:
    npx tfx extension publish \
        --manifest-globs vss-extension.json \
        --auth-type pat \
        --no-prompt \
        -t {{ env_var('AZURE_DEVOPS_PAT') }} \
        -u https://marketplace.visualstudio.com

release version="minor": clean (version version) install build package publish

tag version:
    gh release create {{ version }} -R jahsome/azure-pipelines-just-installer -t {{ version }} -n ''

run:
    node dist/lib