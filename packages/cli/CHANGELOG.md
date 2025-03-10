# @gqless-transport-ws/cli

## 2.0.16

### Patch Changes

- 422eb9a: fix importsNotUsedAsValues error on generated schema
- Updated dependencies [422eb9a]
- Updated dependencies [422eb9a]
  - gqless@2.0.14

## 2.0.15

### Patch Changes

- 4a3d5ef: allow introspection json without "data" field
- af6a437: - Rename `gqlessConfig` to `GQlessConfig` (so it's consistent with the new logo)
  - Rename `gqlessError` to `GQlessError`
  - Remove `endpoint` option from the configuration, and instead always defaults to introspection one
    - It's confusing why theres two of them, and the user can change it later by modifying the file anyway
- 4a3d5ef: disable config file write if no cli usage
- Updated dependencies [4a3d5ef]
- Updated dependencies [af6a437]
  - gqless@2.0.13

## 2.0.14

### Patch Changes

- 7e084fb: accept json introspection schema result

## 2.0.13

### Patch Changes

- 9b9d127: add "usePaginatedQuery" hook
- Updated dependencies [85a389c]
- Updated dependencies [cca9d02]
- Updated dependencies [0904297]
  - gqless@2.0.11

## 2.0.12

### Patch Changes

- Updated dependencies [65c4d32]
  - gqless@2.0.10

## 2.0.11

### Patch Changes

- 5d89cbd: fix generated interfaces
- Updated dependencies [6a9269f]
  - gqless@2.0.9

## 2.0.10

### Patch Changes

- Updated dependencies [c74442e]
- Updated dependencies [d78f2ab]
- Updated dependencies [0ffaa9d]
  - gqless@2.0.8

## 2.0.9

### Patch Changes

- Updated dependencies [ff66195]
- Updated dependencies [63fd3ea]
- Updated dependencies [40d2101]
  - gqless@2.0.7

## 2.0.8

### Patch Changes

- 1eaa4b4: fix not null args & nullable scalar fields

## 2.0.7

### Patch Changes

- eb45ca2: improve generate config conflict warning
- Updated dependencies [173e11d]
- Updated dependencies [c613410]
  - gqless@2.0.6

## 2.0.6

### Patch Changes

- 8f1a329: add "ignoreArgs" schema transform
- Updated dependencies [6fef085]
  - gqless@2.0.5

## 2.0.5

### Patch Changes

- 940883a: fix yarn berry compatibility

## 2.0.4

### Patch Changes

- 2bf4ce2: improve config validation & add javascript output
- Updated dependencies [2bf4ce2]
  - gqless@2.0.4

## 2.0.3

### Patch Changes

- 27f9ece: set "graphql" as optional peerDependency
- Updated dependencies [27f9ece]
  - gqless@2.0.3

## 2.0.2

### Patch Changes

- 7d932f8: fix import gqless
- 6f9416d: set "gqless" as direct dependency
- Updated dependencies [c06ef80]
  - gqless@2.0.2

## 2.0.1

### Patch Changes

- a57cab4: official beta v2 publish
- Updated dependencies [a57cab4]
  - gqless@2.0.1
