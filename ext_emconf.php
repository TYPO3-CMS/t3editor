<?php
$EM_CONF[$_EXTKEY] = [
    'title' => 'Editor with syntax highlighting',
    'description' => 'JavaScript-driven editor with syntax highlighting and codecompletion. Based on CodeMirror.',
    'category' => 'be',
    'state' => 'stable',
    'uploadfolder' => 0,
    'createDirs' => '',
    'clearCacheOnLoad' => 0,
    'author' => 'Tobias Liebig, Stephan Petzl, Christian Kartnig',
    'author_email' => 'mail_typo3@etobi.de, spetzl@gmx.at, office@hahnepeter.de',
    'author_company' => '',
    'version' => '8.7.3',
    'constraints' => [
        'depends' => [
            'typo3' => '8.7.0-8.7.3',
        ],
        'conflicts' => [],
        'suggests' => [],
    ],
];
