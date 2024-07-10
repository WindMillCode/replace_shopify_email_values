
from list_to_dict_utils import revert_mapped_objects_to_lists, replace_lists_with_mapped_objects
# Example key map
key_map = {
  0: 'key0',
  1: 'key1',
  2: 'key2',
  3: 'key3',
  4: 'key4',
  5: 'key5'
}

# Example nested object with nested lists
nested_obj = {
  "level1": {
    "level2": ["a", ["b", "c"], "d"],
    "level2_list": [
      {"level3": ["e", ["f", "g"]]},
      {"level3": ["h", "i", "j"]}
    ],
    "level2_another_list": ["k", "l", "m"]
  },
  "another_level1": {
    "another_level2": ["n", "o"]
  }
}



# Replace lists with mapped objects
result = replace_lists_with_mapped_objects(nested_obj, key_map)
# print(result)

reverted_result = revert_mapped_objects_to_lists(result,key_map)
print(reverted_result)
