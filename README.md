# Angular i18n Translation Key Generator

## Overview

Enhance your Angular application's internationalization process with this Visual Studio Code extension that automatically generates i18n translation keys for HTML and TypeScript files.

## Usage

- **HTML**: Go to your HTMl file, press `F1`, type `createi18nhtml`, and hit `Enter`.
- **TypeScript**: Select a string or multiple string (e.g. alt + mouse selection) in a TypeScript file, press `F1`, type `createi18nts`, and hit `Enter`.

## Examples

### HTML

#### Before:

```html
<input placeholder="Enter your name">
<p>Welcome to our site!</p>
```

#### After:

```html
<input placeholder="Enter your name" i18n-placeholder="@@ANGULAR_FILENAME_ENTERYOURNAME">
<p i18n="@@ANGULAR_FILENAME_WELCOMETOOURSITE">Welcome to our site!</p>
```

### TypeScript

#### Before:

```typescript
const greeting = "Welcome to our site!";
const greeting = "`Welcome to our site ${hello}!`";
```

#### After:

```typescript
const greeting = $localize`:@@ANGULAR_FILENAME_WELCOMETOOURSITE:Welcome to our site!`;
$localize`:@@ANGULAR_FILENAME_WELCOMETOOURSITE:Welcome to our site ${hello}!`;
```

## Support

For questions or updates, visit our [GitHub repository](https://github.com/stealthAngel/angular-i18n-key-injector).
```
