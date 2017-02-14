require 'json'
require 'geocoder'
require 'csv'

$locations_cache = {}
procedure_csv_path = File.join(__dir__, "../csv/procedimentos.csv")

def write_json()
  puts 'Write json'
  File.open('latlng.json', 'w') do |f|
    f.puts $locations_cache.to_json
  end
end

def read_json()
    if File.exists?('latlng.json')
      puts 'Read json'
      file = File.read('latlng.json')
      $locations_cache = JSON.parse(file)
      puts $locations_cache.count
    else
      $locations_cache = {}
    end
end
    
read_json()
size = 30

if $locations_cache.size > size
    size = $locations_cache.size + 30
end

CSV.foreach(procedure_csv_path, :headers => true) do |row|
  cep = row[7]
  if not $locations_cache.key?(cep)
    puts cep
    location = Geocoder.search(cep).first
    sleep(2)

    if not location
      $locations_cache[cep] = location
      next
    end

    location = location.data['geometry']['location']
    $locations_cache[cep] = location
  end

  if $locations_cache.count >= size
    write_json()
    size += 30
  end
end

puts $locations_cache
puts $locations_cache.count
write_json()
