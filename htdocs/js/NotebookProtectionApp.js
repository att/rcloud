define([
    'angular',
     './../../js/ui/NotebookProtectionServices',
    // './../../js/ui/NotebookProtectionDirectives',
    './../../js/ui/NotebookProtectionControllers',
    'selectize'
    ], function (angular) {
        'use strict';

        return angular.module('NotebookProtectionApp', [
            'myapp.services',
            // 'myapp.directives',
            'myapp.controllers'
        ]);     
});