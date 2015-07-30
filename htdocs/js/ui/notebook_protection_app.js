define([
    'angular',
     './../../js/ui/notebook_protection_service',
    // './../../js/ui/NotebookProtectionDirectives',
    './../../js/ui/notebook_protection_controller',
    'selectize'
    ], function (angular) {
        'use strict';

        return angular.module('NotebookProtectionApp', [
            'myapp.services',
            // 'myapp.directives',
            'myapp.controllers'
        ]);
});
