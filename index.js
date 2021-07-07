import React from 'react';
import { Plugin } from '@vizality/entities';
import { getModule } from '@vizality/webpack';
import { openModal } from '@vizality/modal';
import { NewModal, Header, Text } from '@vizality/components';

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
     * options: [{
     * type: ApplicationCommandOptionType.STRING,
     * name: 'message',
     * description: 'Message to say.',
     * required: true
     * }],
     * execute: (options, { channel }) => {
     * sendVizalityBotMessage(channel.id, getModule('getOptionalString').getOptionalString(options, 'message')?.trim() || '');
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
