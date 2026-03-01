import requests
import urllib.parse
import time

def get_links(source_url):
    """Helper to fetch Tidal/Qobuz links from Odesli"""
    odesli_url = f"https://api.song.link/v1-alpha.1/links?url={source_url}&userCountry=US"
    try:
        resp = requests.get(odesli_url).json()
        links = resp.get('linksByPlatform', {})
        tidal = links.get('tidal', {}).get('url', 'N/A')
        qobuz = links.get('qobuz', {}).get('url', 'N/A')
        return tidal, qobuz
    except:
        return 'Error', 'Error'

def search_music():
    print("\n" + "="*60)
    query = input("Search Artist/Album/Song: ").strip()
    if not query: return

    encoded_query = urllib.parse.quote(query)
    
    # 1. Define searches for both Albums and Songs
    search_types = [
        {'entity': 'album', 'label': 'ALBUMS', 'limit': 3},
        {'entity': 'song', 'label': 'SONGS', 'limit': 3}
    ]

    for search in search_types:
        print(f"\n--- Top {search['label']} ---")
        itunes_url = f"https://itunes.apple.com/search?term={encoded_query}&limit={search['limit']}&entity={search['entity']}"
        
        try:
            results = requests.get(itunes_url).json().get('results', [])
            if not results:
                print(f"No {search['label'].lower()} found.")
                continue

            for item in results:
                # Differentiate between Album and Song naming in iTunes API
                name = item.get('collectionName') if search['entity'] == 'album' else item.get('trackName')
                artist = item.get('artistName')
                # Use collectionWindowUrl for albums, trackViewUrl for songs
                url = item.get('collectionViewUrl') if search['entity'] == 'album' else item.get('trackViewUrl')

                print(f"▶ {name} — {artist}")
                
                tidal, qobuz = get_links(url)
                print(f"   🌊 Tidal: {tidal}")
                print(f"   💿 Qobuz: {qobuz}")
                print("-" * 20)
                time.sleep(0.3) # Avoid hitting rate limits

        except Exception as e:
            print(f"Search error: {e}")

if __name__ == "__main__":
    while True:
        search_music()
        if input("\nSearch again? (y/n): ").lower() != 'y':
            break