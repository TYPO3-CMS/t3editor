<?php
declare(strict_types=1);
namespace TYPO3\CMS\T3editor\Tests\Unit\Registry;

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\T3editor\Addon;
use TYPO3\CMS\T3editor\Registry\AddonRegistry;

/**
 * Unit test class for Registry\AddonRegistry
 */
class AddonRegistryTest extends \TYPO3\TestingFramework\Core\Unit\UnitTestCase
{
    /**
     * @var AddonRegistry|\PHPUnit_Framework_MockObject_MockObject|\TYPO3\TestingFramework\Core\AccessibleObjectInterface
     */
    protected $subject;

    protected function setUp()
    {
        $this->subject = $this->getAccessibleMock(AddonRegistry::class, ['dummy'], [], '', false);
        $this->registerAddons();
    }

    /**
     * Register addons for tests
     */
    protected function registerAddons()
    {
        $this->subject
            ->register(GeneralUtility::makeInstance(Addon::class, 'addon/global'))
            ->register(
                GeneralUtility::makeInstance(Addon::class, 'addon/another/global')
                    ->setCssFiles(['EXT:foobar/Resources/Public/Css/Addon.css'])
            )
            ->register(
                GeneralUtility::makeInstance(Addon::class, 'addon/with/same/cssfile')
                    ->setOptions([
                        'foobar' => true,
                        'husel' => 'pusel',
                    ])
                    ->setCssFiles(['EXT:foobar/Resources/Public/Css/Addon.css'])
            )
            ->register(
                GeneralUtility::makeInstance(Addon::class, 'addon/for/mode')
                    ->setModes(['xml', 'htmlmixed'])
            )
            ->register(
                GeneralUtility::makeInstance(Addon::class, 'addon/with/settings')
                    ->setOptions([
                        'foobar' => false,
                        'randomInt' => 4 // chosen by fair dice roll
                    ])
            )
        ;
    }

    /**
     * @test
     */
    public function globalAddonsGetReturned()
    {
        $expected = [
            'addon/global',
            'addon/another/global',
            'addon/with/same/cssfile',
            'addon/with/settings',
        ];

        $actual = [];
        foreach ($this->subject->getForMode() as $addon) {
            $actual[] = $addon->getIdentifier();
        }

        static::assertSame($expected, $actual);
    }

    /**
     * @test
     */
    public function globalAndModeAddonsGetReturned()
    {
        $expected = [
            'addon/global',
            'addon/another/global',
            'addon/with/same/cssfile',
            'addon/for/mode',
            'addon/with/settings',
        ];

        $actual = [];
        foreach ($this->subject->getForMode('xml') as $addon) {
            $actual[] = $addon->getIdentifier();
        }

        static::assertSame($expected, $actual);
    }

    /**
     * @test
     */
    public function settingsAreProperlyCompiled()
    {
        $expected = [
            'foobar' => false,
            'husel' => 'pusel',
            'randomInt' => 4
        ];

        $actual = $this->subject->compileSettings($this->subject->getForMode());

        static::assertSame($expected, $actual);
    }
}
