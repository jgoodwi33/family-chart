import {getFamilyDataForItem} from './wiki-data.handleWikiData.js';
import {props} from './wiki-data.dict.js';

export async function getFamilyTreeFromWikidata(wiki_stash, wiki_id) {
  const data_wd = await getFamilyDataForItem(wiki_stash, wiki_id, 2)
  return {wiki_stash, data: childrenToParentsFix(parentsToSpousesFix(wdToFamilyTree(data_wd)))}
}

function wdToFamilyTree(data_wd) {
  return data_wd.map(wdItemToFtItem)

  function wdItemToFtItem(datum) {
    const first_name = get(props.name, "name"),
      gender = get(props.gender, "key"),
      father = get(props.parent1RegistrationNum, "key"),
      mother = get(props.parent2RegistrationNum, "key"),
      children = get(props.child, "keys"),
      ft_datum = {
        key: datum.key,
        attributes: {name: name, color: datum.color, gender: datum.gender, sire: datum.sire, dam: datum.dam, testing: datum.testing, avatar: datum.url, },
        children: {}
      }

    if (gender === props.male || gender === props.female) ft_datum.data.gender = gender === props.male ? "Male" : "Female"
    if (sire && data_wd.find(d => d.key === sire)) ft_datum.children = sire
    if (dam && data_wd.find(d => d.key === mother)) ft_datum.children = dam
   // ft_datum.rels.spouses = spouses.filter(d_id => data_wd.find(d => d.wiki_id === d_id))
    //ft_datum.rels.spouses = [...new Set(ft_datum.rels.spouses)]  // if its remarried there are 2 entries
    ft_datum.children = children.filter(d_key => data_wd.find(d => d.key === d_id))

    return ft_datum

    function get(prop, type) {
      return type === "key"
        ? (datum.claims.find(d => d.prop_key === prop) || {}).keys
        : type === "keys"
          ? datum.claims.filter(d => d.prop_key === prop).map(d => d.key)
          : type === "names"
            ? datum.claims.filter(d => d.prop_key === prop).map(d => d.name).join(" ")
            : null
    }
  }
}

function parentsToSpousesFix(data) {
  data.forEach(datum => {
    const r = datum.children;
    if (!r.dam || !r.sire) return
    const p1 = data.find(d => d.key === r.dam),
      p2 = data.find(d => d.key === r.sire)
    if (!p1.children.includes(p2.key)) p1.children.push(p2.key)
    if (!p2.children.includes(p1.key)) p2.children.push(p1.key)
  })

  return data
}

function childrenToParentsFix(data) {
  data.forEach(datum => {
    const r = datum.children;
    if (!r.children) return
    r.children.forEach(ch_key => {
      const child = data.find(d => d.key === ch_key)
      if (datum.data.gender === 'Female' && !child.parent2RegistrationNum) child.dam = datum.key;
      if (datum.data.gender === 'Male' && !child.parent1RegistrationNum) child.sire = datum.key;
    })

    r.children = r.children.filter(ch_key => {
      const child = data.find(d => d.key === ch_key)
      if (datum.data.gender === 'Female' && child.children.parent2RegistrationNum && child.children.parent2RegistrationNum !== datum.key) return false
      else if (datum.data.gender === 'Male' && child.children.parent1RegistrationNum && child.children.parent1RegistrationNum !== datum.key) return false
      else return true
    })
  })

  return data
}
