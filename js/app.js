
document.querySelectorAll('.nav button').forEach(btn=>{
 btn.addEventListener('click',()=>{
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(btn.dataset.page).classList.add('active');
 });
});
