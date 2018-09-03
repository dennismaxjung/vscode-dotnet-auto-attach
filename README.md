# VS Code - .NET Auto Attach

The ".NET Auto Attach" extension is created to enable a seemless debugging experience when working with dotnet-watch. While dotnet-watch will rebuild and launch your application everytime you change and store a file, you have to manually restart the debugger each time.

This is where ".NET Auto Attach" comes in and shines. After dotnet-watch restarts your application, it will attach the debugger to enable a seemless debugging experience while changing files on the fly.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

- [C#](https://marketplace.visualstudio.com/items?itemName=ms-vscode.csharp) - C# for Visual Studio Code (powered by OmniSharp).

## Getting Started

1. [Install the extension](https://marketplace.visualstudio.com/items?itemName=dennismaxjung.vscode-dotnet-auto-attach)
2. Restart VS Code and open the folder containing the project you want to work on.

## Using the debugger

When your ".NET: Auto Attach Debug (dotnet-watch)" launch config is set up, you can debug your project. Pick a the launch config from the dropdown on the Debug pane in Code. Press the play button or F5 to start.

### Configuration

The extension operates currently only in one mode - it can launch your project you want to debug with dotnet-watch.

Just like when using the normal C# debugger, you configure the mode with a .vscode/launch.json file in the root directory of your project. You can create this file manually, or Code will create one for you if you try to run your project, and it doesn't exist yet.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `myExtension.enable`: enable/disable this extension
- `myExtension.thing`: set to `blah` to do something

## Release Notes & Known Issues

See the [CHANGELOG.md](CHANGELOG.md) for the details of changes for each version and known issues.

## Built With

- [typescript-collections](https://www.npmjs.com/package/typescript-collections) - It is a complete, fully tested data structure library written in TypeScript.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://gitlab.com/dennismaxjung/vscode-dotnet-auto-attach/tags).

## Authors

- **Dennis Jung** - _Initial work_ - [dennismaxjung](https://gitlab.com/dennismaxjung) [dennismaxjung](https://github.com/dennismaxjung)
- **Konrad Müller** - _Initial work_ - [krdmllr](https://gitlab.com/krdmllr) [krdmllr](https://github.com/krdmllr)

See also the list of [contributors](https://gitlab.com/dennismaxjung/vscode-dotnet-auto-attach/graphs/master) who participated in this project.
Or the list of [members](https://gitlab.com/dennismaxjung/vscode-dotnet-auto-attach/project_members).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details

## Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc
