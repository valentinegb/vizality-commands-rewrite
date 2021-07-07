import React from 'react';
import { Plugin } from '@vizality/entities';
import { getModule } from '@vizality/webpack';
import { openModal } from '@vizality/modal';
import { toPlural, toTitleCase } from '@vizality/util/string';
import { getMediaDimensions } from '@vizality/util/file';
import {
  NewModal,
  Header,
  Text,
  LazyImageZoomable,
  ImageModal,
  Tooltip,
  Anchor,
  FormTitle
} from '@vizality/components';
import { AddonsList } from '@vizality/components/addon';

const applicationId = '861848400714399765';

export default class VizalityCommandsRewrite extends Plugin {
  start () {
    const { BUILT_IN_COMMANDS, BUILT_IN_SECTIONS } = getModule('BUILT_IN_COMMANDS');
    const {
      ApplicationCommandType,
      ApplicationCommandSectionType,
      ApplicationCommandOptionType
    } = getModule('ApplicationCommandType');
    const { ApplicationCommandTarget } = getModule('ApplicationCommandTarget');
    const { getOptionalString } = getModule('getOptionalString');

    const getNextAvailableCommandID = (id = -1) => {
      if (BUILT_IN_COMMANDS.find(command => command.id === `${id}`)) return getNextAvailableCommandID(id - 1);
      return `${id}`;
    };
    /**
     * Registers a built-in Discord command.
     * @param {object} command The command
     * @param {string} command.name Name of the command
     * @param {string} command.description Description of the command
     * @param {object[]} [command.options] The command's options (parameters, basically)
     * @param {Function} [command.predicate] Determines wether the command should be accessible
     * @param {Function} command.execute The function to be executed upon the command being executed
     * @example
     * registerCommand({
     * name: 'say',
     * description: 'Just a test command.',
     * options: [ {
     * type: ApplicationCommandOptionType.STRING,
     * name: 'message',
     * description: 'Message to say.',
     * required: true
     * } ],
     * execute: (options, { channel }) => {
     * sendVizalityBotMessage(
     * channel.id,
     * getOptionalString(options, 'message')?.trim() || ''
     * );
     * }
     * });
     */
    const registerCommand = (command) => {
      const finalCommand = {
        applicationId,
        id: getNextAvailableCommandID(),
        target: ApplicationCommandTarget.CHAT,
        type: ApplicationCommandType.BUILT_IN,
        ...command
      };

      BUILT_IN_COMMANDS.push(finalCommand);

      return finalCommand;
    };
    /**
     * Sends a bot message with a Vizality custom username and avatar.
     * @param {snowflake} channelId ID of the channel to send the message to
     * @param {string} [message] The messages content
     * @param {object[]} [embeds] An array of embeds
     */
    const sendVizalityBotMessage = (channelId, message, embeds) => {
      const clydeMessage = getModule('createBotMessage')
        .createBotMessage(channelId, message, embeds);

      return getModule('receiveMessage').receiveMessage(channelId, {
        ...clydeMessage,
        author: {
          ...clydeMessage.author,
          id: '861848400714399765',
          username: 'Vizality',
          avatar: '215cd0cb8cc45ae6216a594353000d44'
        }
      });
    };

    BUILT_IN_SECTIONS.push({
      id: applicationId,
      type: ApplicationCommandSectionType.GUILD,
      name: 'Vizality Commands',
      icon: '838cbc9f20a59ff7bad484c077220def'
    });

    registerCommand({
      name: 'panic',
      description: 'Temporarily disables Vizality. Reload Discord to restore.',
      execute: () => vizality.stop()
    });

    registerCommand({
      name: 'relaunch',
      description: 'Forcefully relaunches Discord.',
      execute: () => DiscordNative.app.relaunch()
    });

    registerCommand({
      name: 'say',
      description: 'Just a test command.',
      options: [ {
        type: ApplicationCommandOptionType.STRING,
        name: 'message',
        description: 'Message to say.',
        required: true
      } ],
      execute: (options, { channel }) => {
        sendVizalityBotMessage(
          channel.id,
          getOptionalString(options, 'message')?.trim() || ''
        );
      }
    });

    registerCommand({
      name: 'modal',
      description: 'Opens a modal.',
      options: [
        {
          type: ApplicationCommandOptionType.STRING,
          name: 'header',
          description: 'The modal\'s header.',
          required: true
        },
        {
          type: ApplicationCommandOptionType.STRING,
          name: 'content',
          description: 'The modal\'s content.'
        },
        {
          type: ApplicationCommandOptionType.STRING,
          name: 'separator',
          description: 'Toggles the header and content separator.',
          choices: [
            { name: 'Show' },
            { name: 'Hide' }
          ]
        },
        {
          type: ApplicationCommandOptionType.STRING,
          name: 'size',
          description: 'Size of the modal.',
          choices: [
            { name: 'Dynamic' },
            { name: 'Large' },
            { name: 'Medium' },
            { name: 'Small' }
          ]
        }
      ],
      execute: (options) => {
        openModal((props) => (
          <NewModal.Root size={getOptionalString(options, 'size')?.toLowerCase()} {...props}>
            <NewModal.Header justify={getModule('Justify').Justify.BETWEEN} separator={getOptionalString(options, 'separator') === 'Show' || false}>
              <Header size={Header.Sizes.SIZE_20} tag={Header.Tags.H2}>{getOptionalString(options, 'header')?.trim() || ''}</Header>
              <NewModal.CloseButton onClick={props.onClose} />
            </NewModal.Header>
            <NewModal.Content>
              <Text size={Text.Sizes.SIZE_16}>{getOptionalString(options, 'content')?.trim() || ''}</Text>
            </NewModal.Content>
          </NewModal.Root>
        ));
      }
    });

    registerCommand({
      name: 'option_types',
      description: 'You can have spaces in the command name, I just think it looks kind of weird.',
      options: [
        {
          type: ApplicationCommandOptionType.SUB_COMMAND,
          name: 'SUB_COMMAND',
          description: 'Doesn\'t seem to work with built-in commands.'
        },
        {
          type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
          name: 'SUB_COMMAND_GROUP',
          description: 'Doesn\'t seem to work with built-in commands.'
        },
        {
          type: ApplicationCommandOptionType.STRING,
          name: 'STRING',
          description: '(Descriptions are required.)'
        },
        {
          type: ApplicationCommandOptionType.INTEGER,
          name: 'INTEGER',
          description: '(Descriptions are required.)'
        },
        {
          type: ApplicationCommandOptionType.BOOLEAN,
          name: 'BOOLEAN',
          description: '(Descriptions are required.)'
        },
        {
          type: ApplicationCommandOptionType.USER,
          name: 'USER',
          description: '(Descriptions are required.)'
        },
        {
          type: ApplicationCommandOptionType.CHANNEL,
          name: 'CHANNEL',
          description: '(Descriptions are required.)'
        },
        {
          type: ApplicationCommandOptionType.ROLE,
          name: 'ROLE',
          description: '(Descriptions are required.)'
        },
        {
          type: ApplicationCommandOptionType.MENTIONABLE,
          name: 'MENTIONABLE',
          description: '(Descriptions are required.)'
        },
        {
          type: ApplicationCommandOptionType.STRING,
          name: 'STRING with choices',
          description: 'There\'s supposed to be a `value` parameter for each choice, but it doesn\'t seem to do anything.',
          choices: [
            { name: 'Choice A' },
            { name: 'Choice B' },
            { name: 'Choice C' }
          ]
        },
        {
          type: ApplicationCommandOptionType.INTEGER,
          name: 'INTEGER with choices',
          description: 'Don\'t be decieved! This option still returns a string. (Check the console after executing.)',
          choices: [
            { name: '1' },
            { name: '2' },
            { name: '3' }
          ]
        }
      ],
      execute: (options) => {
        this.log('/option_types options', options);
      }
    });

    registerCommand({
      type: ApplicationCommandType.BUILT_IN_TEXT,
      name: 'mock',
      description: 'Mocks someone for their mistakes in chat.',
      options: [ {
        type: ApplicationCommandOptionType.STRING,
        name: 'message',
        description: 'Your message',
        required: true
      } ],
      execute: (options) => ({
        content: getOptionalString(options, 'message')
          ?.split('')
          ?.map((character, index) => index % 2 ? character.toUpperCase() : character.toLowerCase())
          ?.join('') ||
          ''
      })
    });

    [ 'plugin', 'theme' ].forEach((type) => {
      const addons = [];

      vizality.manager[toPlural(type)].keys
        .sort((a, b) => a - b)
        .map(addon => vizality.manager[toPlural(type)].get(addon))
        .forEach((addon) => {
          addons.push({ name: addon.addonId });
        });

      registerCommand({
        name: type,
        description: `Invoke an action on a ${type}.`,
        options: [
          {
            type: ApplicationCommandOptionType.STRING,
            name: 'action',
            description: 'The action to invoke',
            required: true,
            choices: [
              { name: 'settings' },
              { name: 'manage' },
              { name: 'enable' },
              { name: 'disable' },
              { name: 'stop' },
              { name: 'reload' },
              { name: 'list' },
              { name: 'install' },
              { name: 'uninstall' }
            ]
          },
          {
            type: ApplicationCommandOptionType.STRING,
            name: `${type}_id`,
            description: 'Required by the settings, enable, disable, reload, and uninstall actions. Optional for the install action.',
            choices: [ ...addons, { name: 'all' } ]
          },
          {
            type: ApplicationCommandOptionType.STRING,
            name: `${type}_url`,
            description: 'Optional for the install action.'
          },
          {
            type: ApplicationCommandOptionType.STRING,
            name: 'filter',
            description: 'Optional for the list action.',
            choices: [
              { name: 'all' },
              { name: 'enabled' },
              { name: 'disabled' }
            ]
          }
        ],
        execute: (options, { channel }) => {
          const addon_id = getOptionalString(options, `${type}_id`);

          const actions = {
            settings: () => {
              if (!addon_id) {
                sendVizalityBotMessage(channel.id, `You must specify a ${type} to manage its settings.`);
              } else if (!vizality.manager[toPlural(type)].isInstalled(addon_id)) {
                sendVizalityBotMessage(channel.id, `${toTitleCase(type)} \`${addon_id}\` is not installed.`);
              } else {
                if (!vizality.manager[toPlural(type)].isEnabled(addon_id)) {
                  sendVizalityBotMessage(channel.id, `${toTitleCase(type)} \`${addon_id}\` is disabled.`);
                } else if (!vizality.manager[toPlural(type)].hasSettings(addon_id)) {
                  sendVizalityBotMessage(channel.id, `${toTitleCase(type)} \`${addon_id}\` does not have settings.`);
                } else {
                  const addon = vizality.manager[toPlural(type)].get(addon_id);
                  const Settings = addon.sections.settings.render;

                  sendVizalityBotMessage(channel.id, undefined, [ {
                    color: type === 'plugin' ? 0x42ffa7 : 0xb68aff,
                    footer: {
                      text: <Anchor
                        href={`${window.location.origin}/vizality/${toPlural(type)}/${addon_id}`}
                        onClick={e => {
                          e.preventDefault();
                          vizality.api.routes.navigateTo(`/vizality/${toPlural(type)}/${addon_id}`);
                        }}
                      >
                        {addon.manifest.name}
                      </Anchor>,
                      icon_url: addon.manifest.icon
                    },
                    provider: {
                      name: <>
                        <FormTitle tag='h2' className='vz-manager-command-addon-settings-header'>
                          Settings
                        </FormTitle>
                        <Settings />
                      </>
                    }
                  } ]);
                }
              }
            },
            manage: () => {
              sendVizalityBotMessage(channel.id, undefined, [ {
                color: type === 'plugin' ? 0x42ffa7 : 0xb68aff,
                provider: {
                  name: <>
                    <FormTitle tag='h2' className='vz-manager-command-addon-manage-header'>
                      {`Manage ${toTitleCase(toPlural(type))}`}
                    </FormTitle>
                    <AddonsList className='vz-addons-list-embed' type={type} display='compact' limit={8} />
                  </>
                }
              } ]);
            },
            enable: () => {
              if (!addon_id) {
                sendVizalityBotMessage(channel.id, `You must specify a ${type} to enable, or use \`all\` to enable all.`);
              } else if (addon_id === 'all') {
                vizality.manager[toPlural(type)].enableAll();
                sendVizalityBotMessage(channel.id, `All ${toPlural(type)} have been enabled.`);
              } else if (!vizality.manager[toPlural(type)].isInstalled(addon_id)) {
                sendVizalityBotMessage(channel.id, `${toTitleCase(type)} \`${addon_id}\` is not installed.`);
              } else {
                if (vizality.manager[toPlural(type)].isEnabled(addon_id)) {
                  sendVizalityBotMessage(channel.id, `${toTitleCase(type)} \`${addon_id}\` is already enabled.`);
                } else {
                  vizality.manager[toPlural(type)].enable(addon_id);
                  sendVizalityBotMessage(channel.id, `${toTitleCase(type)} \`${addon_id}\` has been enabled.`);
                }
              }
            },
            disable: () => {
              if (!addon_id) {
                sendVizalityBotMessage(channel.id, `You must specify a ${type} to disable, or use \`all\` to disable all.`);
              } else if (addon_id === 'all') {
                vizality.manager[toPlural(type)].disableAll();
                sendVizalityBotMessage(channel.id, `All ${toPlural(type)} have been disabled.`);
              } else if (!vizality.manager[toPlural(type)].isInstalled(addon_id)) {
                sendVizalityBotMessage(channel.id, `${toTitleCase(type)} \`${addon_id}\` is not installed.`);
              } else {
                if (vizality.manager[toPlural(type)].isDisabled(addon_id)) {
                  sendVizalityBotMessage(channel.id, `${toTitleCase(type)} \`${addon_id}\` is already disabled.`);
                } else {
                  vizality.manager[toPlural(type)].disable(addon_id);
                  sendVizalityBotMessage(channel.id, `${toTitleCase(type)} \`${addon_id}\` has been disabled.`);
                }
              }
            },
            stop: () => {
              try {
                vizality.manager[toPlural(type)].stop();
              } catch (error) {
                sendVizalityBotMessage(channel.id, `There was a problem terminating all ${toPlural(type)}:\n\`${error}\``);
              }
            },
            reload: () => {
              if (!addon_id) {
                sendVizalityBotMessage(channel.id, `You must specify a ${type} to reload, or use \`all\` to reload all.`);
              } else if (addon_id === 'all') {
                vizality.manager[toPlural(type)].reloadAll();
                sendVizalityBotMessage(channel.id, `All ${toPlural(type)} have been reloaded.`);
              } else if (!vizality.manager[toPlural(type)].isInstalled(addon_id)) {
                sendVizalityBotMessage(channel.id, `${toTitleCase(type)} \`${addon_id}\` is not installed.`);
              } else {
                if (vizality.manager[toPlural(type)].isDisabled(addon_id)) {
                  sendVizalityBotMessage(channel.id, `${toTitleCase(type)} \`${addon_id}\` is disabled.`);
                } else {
                  vizality.manager[toPlural(type)].reload(addon_id);
                  sendVizalityBotMessage(channel.id, `${toTitleCase(type)} \`${addon_id}\` has been reloaded.`);
                }
              }
            },
            list: async () => {
              const filter = getOptionalString(options, 'filter') || 'all';
              let addons;

              switch (filter) {
                case 'all': addons = vizality.manager[toPlural(type)].keys; break;
                case 'enabled': addons = vizality.manager[toPlural(type)].getEnabledKeys(); break;
                case 'disabled': addons = vizality.manager[toPlural(type)].getDisabledKeys(); break;
              }

              if (!addons.length) {
                switch (filter) {
                  case 'all': sendVizalityBotMessage(channel.id, `You have no ${toPlural(type)} installed.`); break;
                  case 'enabled': sendVizalityBotMessage(channel.id, `You have no ${toPlural(type)} enabled.`); break;
                  case 'disabled': sendVizalityBotMessage(channel.id, `You have no ${toPlural(type)} disabled.`); break;
                }
              }

              const items = [];

              const renderAddonItem = async (addonId) => {
                const addon = vizality.manager[toPlural(type)].get(addonId);
                addon && items.push(
                  <div className='vz-embed-table-grid-row'>
                    <div className='vz-embed-table-grid-row-inner'>
                      <LazyImageZoomable
                        className='vz-manager-command-list-embed-table-addon-image-wrapper'
                        imageClassName='vz-manager-command-list-embed-table-addon-img'
                        src={addon.manifest.icon}
                        width='20'
                        height='20'
                        shouldLink={false}
                        onClick={async () => {
                          const albumDimensions = await getMediaDimensions(addon.manifest.icon);
                          openModal(() =>
                            <ImageModal
                              src={addon.manifest.icon}
                              width={albumDimensions.width}
                              height={albumDimensions.height}
                            />);
                        }}
                      />
                      <Tooltip text={addonId}>
                        <Anchor
                          type={type}
                          addonId={addonId}
                          className='vz-embed-table-grid-row-inner-text'
                        >
                          {addon.manifest.name}
                        </Anchor>
                      </Tooltip>
                    </div>
                    <div className='vz-embed-table-grid-row-inner'>
                      <Anchor
                        type='user'
                        userId={addon.manifest.author.id}
                        className='vz-embed-table-grid-row-inner-text'
                      >
                        {typeof addon.manifest.author === 'string' ? addon.manifest.author : addon.manifest.author.name}
                      </Anchor>
                    </div>
                    <div className='vz-embed-table-grid-row-inner'>
                      {addon.manifest.version}
                    </div>
                  </div>
                );
              };

              const renderItems = async () => {
                return Promise.all(addons.map(renderAddonItem));
              };

              sendVizalityBotMessage(channel.id, undefined, [ {
                title: `${filter === 'all' ? '' : `${toTitleCase(filter)} `}${toTitleCase(toPlural(type))} List`,
                description: `${addons.length} ${filter === 'all' ? '' : `${filter.toLowerCase()} `}${toPlural(type)} were found.`,
                color: type === 'plugin' ? 0x42ffa7 : 0xb68aff,
                footer: {
                  text: <>
                    {await renderItems().then(() => {
                      return (
                        <div className='vz-embed-table vz-manager-command-list-embed-table'>
                          <div className='vz-embed-table-grid-header vz-embed-table-grid-row'>
                            <div className='vz-embed-table-grid-header-inner'>
                              Name
                            </div>
                            <div className='vz-embed-table-grid-header-inner'>
                              Author
                            </div>
                            <div className='vz-embed-table-grid-header-inner'>
                              Version
                            </div>
                          </div>
                          {items.map(item => item)}
                        </div>
                      );
                    })}
                  </>
                }
              } ]);
            },
            install: () => {
              const addon_url = getOptionalString(options, `${type}_url`);

              if (!addon_url && !addon_id) {
                sendVizalityBotMessage(channel.id, `You must specify a \`${type}_url\` or \`${type}_id\` to install a ${type} from.`);
              } else {
                vizality.manager[toPlural(type)].install(addon_url || addon_id);
              }
            },
            uninstall: () => {
              if (!addon_id) {
                sendVizalityBotMessage(channel.id, `You must specify a ${type} to uninstall.`);
              } else if (!vizality.manager[toPlural(type)].isInstalled(addon_id)) {
                sendVizalityBotMessage(channel.id, `${toTitleCase(type)} \`${addon_id}\` is not installed.`);
              } else {
                try {
                  vizality.manager[toPlural(type)].uninstall(addon_id);
                } catch (error) {
                  sendVizalityBotMessage(channel.id, error);
                }
              }
            },
            none: () => {
              sendVizalityBotMessage(channel.id, 'Please specify a valid action to invoke.');
            }
          };

          actions[getOptionalString(options, 'action') || 'none']();
        }
      });
    });
  }

  stop () {
    const { BUILT_IN_COMMANDS, BUILT_IN_SECTIONS } = getModule('BUILT_IN_COMMANDS');

    BUILT_IN_SECTIONS.splice(
      BUILT_IN_SECTIONS.indexOf(
        BUILT_IN_SECTIONS.find(section => section.id === applicationId)
      ),
      1
    );

    const firstVizalityCommandIndex = BUILT_IN_COMMANDS.indexOf(
      BUILT_IN_COMMANDS.find(command => command.applicationId === applicationId)
    );
    BUILT_IN_COMMANDS.splice(
      firstVizalityCommandIndex,
      BUILT_IN_COMMANDS.length - firstVizalityCommandIndex
    );
  }
}
