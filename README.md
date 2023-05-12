


### createi18n

press F1 and type createi18n and hit enter.

`<button class="">
hello world
</button>`

becomes

`<button class="" i18n="@@ANGULAR_FILENAME_HELLOWORLD">
hello world
</button>`

`<input placeholder="test">`

becomes 

`<input placeholder="test" i18n-placeholder="ANGULAR_FILENAME_TEST">`

Run the script on any HTML page and see the magic.

support at https://github.com/stealthAngel/angular-i18n-key-injector