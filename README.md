# image2pattern
A simple electron app to convert an image to a cross-stitch pattern.

<div align='center'>
    <img src='./sample_images/AHC_4958.png' style='width: 20rem'>
    <img src='./sample_images/AHC_4958 generated.png' style='width: 20rem'>
</div>

## Status
[![CircleCI](https://circleci.com/gh/acrosman/image2pattern/tree/master.svg?style=svg)](https://circleci.com/gh/acrosman/image2pattern/tree/master)

## Setup Instructions

Not currently packaged as an executable application on any platform. To run you
will need to have node installed and running on your local system.

###### To begin working locally:

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your
   own GitHub account
2. [Clone](https://help.github.com/articles/cloning-a-repository/) it to your
   local device
4. Install the dependencies: `npm install`
5. Run the app by starting electron, building the code and watch for changes:
   `npm start`

A couple test wrappers to aid debugging and development:

`npm run image-test`

`npm run gen-test`

Pull requests and suggestions welcome.
