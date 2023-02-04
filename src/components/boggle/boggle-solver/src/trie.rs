use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct TrieNode {
    value: Option<char>,
    is_final: bool,
    child_nodes: HashMap<char, TrieNode>,
}

impl TrieNode {
    pub fn new(c: char, is_final: bool) -> TrieNode {
        TrieNode {
            value: Option::Some(c),
            is_final: is_final,
            child_nodes: HashMap::new(),
        }
    }

    pub fn new_root() -> TrieNode {
        TrieNode {
            value: Option::None,
            is_final: false,
            child_nodes: HashMap::new(),
        }
    }

    pub fn insert_value(&mut self, c: char, is_final: bool) {
        self.child_nodes.insert(c, TrieNode::new(c, is_final));
    }
}

#[derive(Debug)]
pub struct TrieStruct {
    root_node: TrieNode,
}

impl TrieStruct {
    pub fn create() -> TrieStruct {
        TrieStruct {
            root_node: TrieNode::new_root(),
        }
    }

    // Insert a string
    pub fn insert(&mut self, string_val: String) {
        // starting at the root node
        let mut current_node = &mut self.root_node;
        // convert the string to a list of characters
        let char_list: Vec<char> = string_val.chars().collect();
        // pointer to most recent match
        let mut last_match = 0;
        // for the length of the string
        for letter_counter in 0..char_list.len() {
            // if the current node has a child node with the current character
            if current_node
                .child_nodes
                .contains_key(&char_list[letter_counter])
            {
                // set the current node to the child node
                current_node = current_node
                    .child_nodes
                    .get_mut(&char_list[letter_counter])
                    .unwrap();
            } else {
                // if the current node does not have a child node with the current character
                last_match = letter_counter;

                // break out of the loop
                break;
            }
            // and continue the loop to the next character
            last_match = letter_counter + 1;
        }

        // if the last match is the length of the string
        // set the current node to final
        if last_match == char_list.len() {
            current_node.is_final = true;
        } else {
            // else insert the rest of the new string into the trie
            // starting from the last match
            for new_counter in last_match..char_list.len() {
                // recursively insert the rest of the new string
                current_node.insert_value(char_list[new_counter], false);

                // set the current node to the child node
                current_node = current_node
                    .child_nodes
                    .get_mut(&char_list[new_counter])
                    .unwrap();
            }
            // once the rest of the string is inserted
            // set the current node to final
            current_node.is_final = true;
        }
    }

    pub fn is_word(&mut self, string_val: &mut String) -> bool {
        let mut current_node = &mut self.root_node;
        let char_list: Vec<char> = string_val.chars().collect();

        for counter in 0..char_list.len() {
            if !current_node.child_nodes.contains_key(&char_list[counter]) {
                return false;
            } else {
                current_node = current_node
                    .child_nodes
                    .get_mut(&char_list[counter])
                    .unwrap();
            }
        }
        // is final check to determine if the word is in the trie
        return current_node.is_final;
    }

    pub fn is_prefix(&mut self, string_val: &mut String) -> bool {
        let mut current_node = &mut self.root_node;
        let char_list: Vec<char> = string_val.chars().collect();

        for counter in 0..char_list.len() {
            if !current_node.child_nodes.contains_key(&char_list[counter]) {
                return false;
            } else {
                current_node = current_node
                    .child_nodes
                    .get_mut(&char_list[counter])
                    .unwrap();
            }
        }
        return true;
    }
}
