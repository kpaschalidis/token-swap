#!/bin/sh

if ! [ -x "$(command -v sha256sum)" ]; then
    >&2 echo "The \"sha256sum\" command was not detected in path, please install it. 🔥"
    exit 1
fi

if [ -z $CI_COMMIT_REF_SLUG ]; then
    >&2 echo "Variable \"CI_COMMIT_REF_SLUG\" not defined or empty."
    exit 1
fi

if printf "$CI_COMMIT_REF_SLUG" | grep -E '^[0-9]+-[0-9]+-[0-9]+$' > /dev/null; then
    printf "prod"
else
    printf "$CI_COMMIT_REF_SLUG"
fi
