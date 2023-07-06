import { useEffect, createContext, useContext, useState } from 'react';
import useToggle from './useToggle';
import useLoader from './useLoader';
import { Section, InfoSection } from './section';
import './App.css';

const AppContext = createContext();

function Heading({ role = 'primary', children }) {
  switch(role) {
    case 'secondary':
      return <h2 className='text-secondary-emphasis'>
        {children}
      </h2>
    case 'tertiary':
      return <h6 className='text-tertiary-emphasis'>
        {children}
      </h6>
    default:
      return <h1 className='text-primary-emphasis'>
        {children}
      </h1>
  }
}

function SearchBar({ queryHandler }) {
  const ctx = useContext(AppContext);

  const onChange = evt => {
    queryHandler(evt.target.value);
  }

  return <div className='input-group'>
    <input type='text' className='form-control' id='searchString' value={ctx.currentQuery} onChange={onChange}/>
    <button className='btn btn-secondary' type='button' id='button-addon2' onClick={() => queryHandler("")}>
      <span className='bi-backspace'></span>
    </button>
  </div>
}

function AlbumImage({ title, image, photographer, assetId }) {
  const ctx = useContext(AppContext);

  return <div className='card h-100 card-hoverable' onClick={() => ctx.assetHandler(assetId)}>
    <img src={image} className='card-img-top' alt={title} />
    <div className='card-body'>
      {title}
    </div>
    <div className='card-footer'>
      <small className='text-body-secondary'>{photographer ? photographer : "Uncredited"}</small>
    </div>
  </div>
}

function Album() {
  const ctx = useContext(AppContext);
  const [state, dispatch] = useLoader({
    status: 'INITIALIZE',
    result: null,
    error: null
  });

  useEffect(() => {
    if (!ctx.currentQuery) return;

    dispatch({ action: 'LOADING' });
    const endPoint = `https://images-api.nasa.gov/search?q=${ctx.currentQuery}&media_type=image`
    fetch(endPoint)
      .then(res => res.json())
      .then(data => data.collection.items.map((image) => {
        return {
          title: image.data[0].title,
          description: image.data[0].description,
          thumb: image.links[0].href,
          photographer: image.data[0].photographer,
          assetId: image.data[0].nasa_id
        }
      }))
      .then(images => dispatch({ action: 'SUCCESS', payload: images }))
      .catch(message => dispatch({ action: 'FAILURE', payload: message }))
  }, [ctx.currentQuery, dispatch]);

  const { status, error, result } = state;

  switch(status) {
    case 'LOADING':
      return <InfoSection headerText='Loading...' bodyText='Loading...' icon='spinner-border' />
    case 'SUCCESS':
      return <Section role='tertiary' header={`Showing search results for ${ctx.currentQuery}`}>
        <div className='row row-col-4 g-3'>
        {result.map((image, i) => {
          return <div key={i} className='col-md-3'>
              <AlbumImage 
                key={i} 
                image={image.thumb} 
                title={image.title} 
                photographer={image.photographer}
                assetId={image.assetId}
              />
            </div>
        })}
        </div>
      </Section>
    case 'FAILURE':
      return <InfoSection headerText='Oops!' bodyText={error.message} />
    default:
      return <InfoSection headerText='Initialising' bodyText='Initialising' icon='spinner-grow' />
  }
}

function ImageDetail() {
  const ctx = useContext(AppContext);

  const [state, dispatch] = useLoader({
    status: 'INITIALIZE',
    result: null,
    error: null
  });

  useEffect(() => {
    if (!ctx.currentAsset) return;

    dispatch({ action: 'LOADING' });
    const endPoint = `https://images-api.nasa.gov/asset/${ctx.currentAsset}`
    fetch(endPoint)
      .then(res => res.json())
      .then(data => data.collection.items.filter(image => image.href.includes('~orig'))[0].href)
      .then(image => image.replace('http://', 'https://'))
      .then(image => dispatch({ action: 'SUCCESS', payload: image }))
      .catch(message => dispatch({ action: 'FAILURE', payload: message }))
  }, [ctx.currentAsset, dispatch]);

  const { status, error, result } = state;

  switch(status) {
    case 'LOADING':
      return <InfoSection headerText='Loading...' bodyText='Loading...' icon='spinner-border' />
    case 'SUCCESS':
      return <Section role='tertiary' header={`NASA Asset ${ctx.currentAsset}`}>
        <button type='button' style={{marginBottom: '5px'}} onClick={() => ctx.assetHandler(null)} className='btn btn-secondary'>
          <i className='bi-backspace' />
        </button>
        <div className='row'>
          <div className='col-xs-12'>
            <img src={result} alt={ctx.currentAsset} className='img-fluid'/>
          </div>
        </div>
      </Section>
    case 'FAILURE':
      return <InfoSection headerText='Oops!' bodyText={error.message} />
    default:
      return <InfoSection headerText='Initialising' bodyText='Initialising' icon='spinner-grow' />
  } 
}

function ColorModeToggle({ toggleHandler }) {
  const ctx = useContext(AppContext);
  return <button type='button' onClick={toggleHandler} className='btn btn-secondary float-end'>
    <i className={ctx.darkMode ? 'bi-sun' : 'bi-moon-stars'}></i>
  </button>
}

function App() {
  const [isDarkMode, toggleDarkMode] = useToggle(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentAsset, setCurrentAsset] = useState("");

  useEffect(() => {
    document.getElementsByTagName('html')[0].dataset.bsTheme = isDarkMode ? 'dark' : 'light';
  });

  return <div className='container-fluid'>
      <AppContext.Provider value={
        {
          darkMode: isDarkMode, 
          currentQuery: searchQuery, 
          currentAsset: currentAsset, 
          assetHandler: setCurrentAsset}
        }>
        <Section>
          <ColorModeToggle toggleHandler={toggleDarkMode} />
          <Heading>NASA Imager</Heading>
        </Section>

        {currentAsset ? 
          <ImageDetail /> :
          <>
            <Section role='secondary'>
              <Heading role='secondary'>Search Images</Heading>
              <SearchBar queryHandler={setSearchQuery} />
            </Section>
            {(searchQuery && <Album />)}
          </>
        }
      </AppContext.Provider>
  </div>
}

export default App;