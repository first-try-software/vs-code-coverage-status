# Coverage Status

Coverage Status is a Visual Studio Code plug-in that displays code coverage from either SimpleCov or LCOV formats in the status bar.

## Requirements

In order to make use of this extension you need to have code coverage data available. The extension supports SimpleCov for Ruby projects, and LCOV for all other types of projects. You may configure the location of your coverage files in Settings. The defaults are:

```
"coverage-status.searchPatterns": [
  "coverage/.resultset.json",
  "coverage/lcov*.info"
]
```

## Release Notes

Please see our [CHANGELOG][cl].

## Contributing

Bug reports and pull requests are welcome on [GitHub][git].

## License

The plugin is available as open source under the terms of the [MIT License][mit].

## Code of Conduct

Everyone interacting in the project's codebases, issue trackers, chat rooms and mailing lists is expected to follow the [code of conduct][cod].

[cl]: https://github.com/first-try-software/vs-code-coverage-status/blob/main/CHANGELOG.md
[git]: https://github.com/first-try-software/vs-code-coverage-status
[cod]: https://github.com/first-try-software/vs-code-coverage-status/blob/main/CODE_OF_CONDUCT.md
[mit]: https://opensource.org/licenses/MIT
