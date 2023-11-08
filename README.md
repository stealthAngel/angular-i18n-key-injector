


### createi18n

This package is able to add translation keys to your html page without you needing to write it.


press F1 to open the input field and type createi18n, then hit enter key

The sample changes on your html file will look like the following:

Before:
`
<input placeholder="test">
<button class="">
hello world
</button>`

After:
`
<input placeholder="test" i18n-placeholder="ANGULAR_FILENAME_TEST">
<button class="" i18n="@@ANGULAR_FILENAME_HELLOWORLD">
hello world
</button>`
`

Run the script on any HTML page and see the magic.

support, questions or needing an update go to: https://github.com/stealthAngel/angular-i18n-key-injector
