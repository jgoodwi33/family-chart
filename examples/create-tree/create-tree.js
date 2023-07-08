import f3 from '../../src/index.js'
import Edit from './elements/Edit.js'
import ReactiveTextarea from "./elements/ReactiveTextarea.js"
import ReactiveVanila from "./elements/ReactiveVanila.js"
import ReactiveVue from "./elements/ReactiveVue.js"
import ReactiveReact from "./elements/ReactiveReact.js"
import Display from "./elements/Display.js"
import {Form} from "../../src/view/elements/Form.js"


(async () => {
  const cont = document.querySelector("#FamilyChart"),
    card_dim = {w:220,h:70,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5},
    card_display = cardDisplay(),
    card_edit = cardEditParams(),
    store = f3.createStore({
      data: firstNode(),
      node_separation: 250,
      level_separation: 150
    }),
    view = f3.d3AnimationView({
      store,
      cont: document.querySelector("#FamilyChart"),
      card_edit,
    }),
    Card = f3.elements.Card({
      store,
      svg: view.svg,
      card_dim,
      card_display,
      mini_tree: true,
      link_break: false,
      cardEditForm,
      addRelative: f3.handlers.AddRelative({store, cont, card_dim, cardEditForm, labels: {dam: 'Add dam'}}),
    }),
    edit = Edit('#edit_cont', card_edit),
    display = Display('#display_cont', store, card_display),
    reactiveTextArea = ReactiveTextarea(data => {store.update.data(data); store.update.tree()}, "#textarea", "#update_btn"),
    reactiveVanila = ReactiveVanila( "#ReactiveVanila"),
    reactiveVue = ReactiveVue( "#ReactiveVue"),
    reactiveReact = ReactiveReact( "#ReactiveReact"),
    onUpdate = (props) => {
      view.update(props || {});
      reactiveTextArea.update(store.getData());
      reactiveVanila.update(store, card_display);
      reactiveVue.update(store, card_display);
      reactiveReact.update(store, card_display);
    }

  view.setCard(Card)
  fetch('./elements/family-chart.css').then(r => r.text()).then(text => document.querySelector('#family-chart-css').innerText = text)
  store.setOnUpdate(onUpdate)
  store.update.tree({initial: true})

  function cardEditForm(props) {
    const postSubmit = props.postSubmit;
    props.postSubmit = (ps_props) => {postSubmit(ps_props)}
    const el = document.querySelector('#form_modal'),
      modal = M.Modal.getInstance(el),
      edit = {el, open:()=>modal.open(), close:()=>modal.close()}
    Form({...props, card_edit, card_display, edit})
  }
})();

function firstNode() {
  return [{id: '1', children: {}, data: {'name': 'Name', 'key': "key", 'parents': 'color',
      avatar: 'https://static8.depositphotos.com/1009634/988/v/950/depositphotos_9883921-stock-illustration-no-user-profile-picture.jpg', gender: "M"}}]
}

function cardEditParams() {
  return [
    {type: 'text', placeholder: 'name', key: 'name'},
    {type: 'text', placeholder: 'key', key: 'key'},
    {type: 'text', placeholder: 'gender', key: 'gender'},
    {type: 'text', placeholder: 'color', key: 'color'},
    {type: 'text', placeholder: 'parents', key: 'parents'},
    {type: 'text', placeholder: 'avatar', key: 'url'}

  ]
}

function cardDisplay() {
  const d1 = d => `${d.data['name'] || ''}`,
    d2 = d => `${d.data['color'] || ''}`,
        d3 = d => `${d.data['testing'] || ''}`
  d1.create_form = "{name}"
  d2.create_form = "{color}"
  d3.create_form = "{testing}"

  return [d1, d2, d3]
}
