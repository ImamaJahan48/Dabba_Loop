-- Demo/pilot seed data. Safe to edit before first remote push.
insert into public.hubs(name,slug,type,area,address,pickup_label,lunch_pickup_time,dinner_pickup_time,capacity)
values
('UOL Hostel Hub','uol-hostel','hostel','Defence Road','Main hostel reception','12:45 PM / 7:15 PM','12:45','19:15',60),
('Johar Town Work Hub','johar-work','office','Johar Town','Office reception cluster','1:10 PM','13:10',null,45),
('Valencia Community Hub','valencia-community','community','Valencia','Central pickup desk','1:00 PM / 7:30 PM','13:00','19:30',35)
on conflict(slug) do update set name=excluded.name,area=excluded.area,address=excluded.address,active=true;

insert into public.meals(name,description,category,allergens,calories,protein_grams,accent)
values
('Home-style Chicken Karahi','Slow-cooked tomato masala, two rotis, raita and crisp salad.','Daily',array['dairy'],620,38,'coral'),
('Daal Chana Bowl','Comforting chana daal, steamed rice, achar and cucumber raita.','Light',array['dairy'],510,21,'lime'),
('Aloo Qeema','Beef mince with potatoes, two rotis, mint raita and salad.','Daily',array['dairy'],670,34,'gold'),
('Chicken Yakhni Pulao','Fragrant basmati rice, chicken, raita and house chutney.','Daily',array['dairy'],640,31,'blue')
on conflict(name) do update set description=excluded.description,active=true;

insert into public.credit_packs(name,credits,price,validity_days,description,featured)
values
('Starter 5',5,1745,30,'Try the system without a monthly commitment.',false),
('Flex 10',10,3390,45,'Best for students with shifting schedules.',true),
('Monthly 20',20,6580,60,'For regular hostel and office routines.',false)
on conflict(name) do update set credits=excluded.credits,price=excluded.price,active=true;

insert into public.menu_slots(service_date,period,meal_id,price,credit_cost,capacity,cutoff_at)
select current_date,'lunch',id,369,1,50,(current_date + time '09:30') at time zone 'Asia/Karachi' from public.meals where name='Home-style Chicken Karahi'
on conflict(service_date,period,meal_id) do nothing;
insert into public.menu_slots(service_date,period,meal_id,price,credit_cost,capacity,cutoff_at)
select current_date,'lunch',id,299,1,40,(current_date + time '09:30') at time zone 'Asia/Karachi' from public.meals where name='Daal Chana Bowl'
on conflict(service_date,period,meal_id) do nothing;
insert into public.menu_slots(service_date,period,meal_id,price,credit_cost,capacity,cutoff_at)
select current_date,'dinner',id,379,1,45,(current_date + time '15:30') at time zone 'Asia/Karachi' from public.meals where name='Aloo Qeema'
on conflict(service_date,period,meal_id) do nothing;
insert into public.menu_slots(service_date,period,meal_id,price,credit_cost,capacity,cutoff_at)
select current_date+1,'lunch',id,369,1,55,((current_date+1) + time '09:30') at time zone 'Asia/Karachi' from public.meals where name='Chicken Yakhni Pulao'
on conflict(service_date,period,meal_id) do nothing;
insert into public.menu_slots(service_date,period,meal_id,price,credit_cost,capacity,cutoff_at)
select current_date+1,'dinner',id,299,1,45,((current_date+1) + time '15:30') at time zone 'Asia/Karachi' from public.meals where name='Daal Chana Bowl'
on conflict(service_date,period,meal_id) do nothing;
