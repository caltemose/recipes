# Recipes

This repo serves as a collection of recipes and styling exercises to find the most useful methods of styling recipes for my own personal use. You can view the results online at [https://caltemose.github.io/recipes](https://caltemose.github.io/recipes).

## Development Information

This repository uses a gulp-based build system that depends on data exported from a different project at [https://github.com/caltemose/fms-recipes-api](https://github.com/caltemose/fms-recipes-api).

### Available NPM Tasks

`npm start` will start the development task with source watching and a local browser-sync server.

`npm run preview` will fire up a local server to preview files in the `dist` folder. It will *not* run the build task first. To do that use `npm run build`

`npm run deploy` uses the ghpages gulp task to build, compress and push static files to github at [https://caltemose.github.io/recipes](https://caltemose.github.io/recipes)