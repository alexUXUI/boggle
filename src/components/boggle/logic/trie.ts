const englishCharArr = 'abcdefghijklmnopqrstuvwxyz'.split('');

type Char = typeof englishCharArr[number];
export interface TrieNode {
  isWord?: boolean | undefined;
  children: {
    [key: Char]: TrieNode;
  };
}

class TrieClass {
  root: TrieNode = {
    children: {},
  };
  constructor() {
    this.root = {
      children: {},
    };
  }

  add(word: string) {
    let currentNode: TrieNode = this.root;

    for (let index = 0; index < word.length; index++) {
      const letter = word[index];

      if (!currentNode.children) {
        currentNode.children = {};
      }

      if (!currentNode.children[letter]) {
        currentNode.children[letter] = {
          children: {},
        };
      }

      if (index === word.length - 1) {
        currentNode.children![letter].isWord = true;
      } else {
        currentNode = currentNode.children![letter];
      }
    }
  }

  containsWord(word: string) {
    let currentNode = this.root;
    for (let index = 0; index < word.length; index++) {
      const letter = word[index];

      if (!currentNode.children![letter]) {
        return false;
      }

      currentNode = currentNode.children![letter];

      if (index === word.length - 1 && currentNode.isWord) {
        return true;
      }
    }

    return false;
  }

  containsPrefix(prefix: string) {
    let currentNode = this.root;
    for (let index = 0; index < prefix.length; index++) {
      const letter = prefix[index];

      if (!currentNode.children![letter]) {
        return false;
      }

      currentNode = currentNode.children![letter];
    }

    return true;
  }
}

export const trie = new TrieClass();
