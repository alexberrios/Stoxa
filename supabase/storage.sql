-- Ejecutar después de crear el bucket "product-images" (privado) en Storage > Buckets

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', false)
on conflict (id) do nothing;

create policy "Users upload own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users read own files"
on storage.objects for select to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users update own files"
on storage.objects for update to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users delete own files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
