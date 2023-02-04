export const Trie: any = function (this: any) {
  this.root = {};
};

// Add a word to the Trie
Trie.prototype.add = function (word: string) {
  // start at the root
  let currentNode = this.root;

  // for each letter in the word
  for (let index = 0; index < word.length; index++) {
    const letter = word[index];
    // if the letter is not in the trie add it
    if (!currentNode[letter]) {
      currentNode[letter] = {};
    }

    // when we reach the end of the word mark it as a word
    if (index === word.length - 1) {
      currentNode[letter].isWord = true;
    } else {
      // else make the newly added letter the current node and continue
      currentNode = currentNode[letter];
    }
  }
};

// Print the Trie
Trie.prototype.showTrie = function () {
  console.log(JSON.stringify(this.root, null, "  "));
};

// Check if a word is in the Trie
Trie.prototype.containsWord = function (word: string) {
  let currentNode = this.root;
  for (let index = 0; index < word.length; index++) {
    const letter = word[index];

    if (!currentNode[letter]) {
      return false;
    }

    currentNode = currentNode[letter];

    if (index === word.length - 1 && currentNode.isWord) {
      //   console.log(`found ${word} the trie`);
      return true;
    }
  }

  return false;
};

// Check if a prefix is in the Trie
Trie.prototype.containsPrefix = function (prefix: string) {
  let currentNode = this.root;
  for (let index = 0; index < prefix.length; index++) {
    const letter = prefix[index];

    if (!currentNode[letter]) {
      return false;
    }

    currentNode = currentNode[letter];
  }

  return true;
};

export const trie = new Trie();
